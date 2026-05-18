import { useState, useEffect } from 'react';
import { supabase, type Order } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Clock, MessageCircle, ClipboardList } from 'lucide-react';

interface OrderManagerProps {
  onPendingCountChange?: (count: number) => void;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'confirmed', label: 'Confirmée', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'delivered', label: 'Livrée', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'cancelled', label: 'Annulée', color: 'bg-red-100 text-red-800 border-red-200' },
];

const getStatusInfo = (status: string) => {
  return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
};

const OrderManager = ({ onPendingCountChange }: OrderManagerProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_phone,
          customer_address,
          client_email,
          canal,
          total_amount,
          status,
          created_at,
          order_items (
            id,
            quantity,
            unit_price,
            product_id,
            produits (
              id,
              nom,
              marque
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Re-fetch all orders on any change (INSERT, UPDATE, DELETE)
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Notify parent of pending count
  useEffect(() => {
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    onPendingCountChange?.(pendingCount);
  }, [orders, onPendingCountChange]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating status:', error);
      return;
    }
    // Optimistic update
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    );
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-secondary/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-foreground">Commandes</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Temps réel activé
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Aucune commande pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <div
                key={order.id}
                className={`p-5 rounded-xl border bg-card transition-all hover:shadow-sm ${
                  order.status === 'pending' ? 'border-yellow-200 bg-yellow-50/30' : 'border-border'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">
                      #{order.id.substring(0, 8)}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    {order.canal === 'whatsapp' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20">
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                        <ClipboardList className="w-3 h-3" />
                        Formulaire
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-[160px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Client info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{order.customer_name}</span>
                  </div>
                  {order.customer_phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {order.customer_phone}
                    </div>
                  )}
                  {order.client_email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {order.client_email}
                    </div>
                  )}
                  {order.customer_address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {order.customer_address}
                    </div>
                  )}
                </div>

                {/* Articles */}
                <div className="bg-secondary/30 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Articles</p>
                  <div className="space-y-1">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-foreground">
                          {item.quantity}× {item.produits?.nom || 'Produit inconnu'}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {(item.quantity * item.unit_price).toLocaleString()} FCFA
                        </span>
                      </div>
                    )) ?? (
                      <p className="text-xs text-muted-foreground">Aucun article</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(order.created_at)}
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {order.total_amount?.toLocaleString()} <span className="text-sm font-medium text-muted-foreground">FCFA</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderManager;
