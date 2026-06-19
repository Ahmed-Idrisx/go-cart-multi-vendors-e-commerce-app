"use client";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import { orderDummyData } from "@/assets/assets";
import { Order, OrderStatus } from "@/types/types";

export default function StoreOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    setOrders(orderDummyData);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    // Logic to update the status of an order
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );
  };

  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <h1 className="text-2xl text-slate-500 dark:text-slate-400 mb-5">
        Store{" "}
        <span className="text-slate-800 dark:text-slate-100 font-medium">
          Orders
        </span>
      </h1>
      {orders.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No orders found</p>
      ) : (
        <div className="overflow-x-auto max-w-4xl rounded-md shadow border border-gray-200 dark:border-slate-700">
          <table className="w-full text-sm text-left text-gray-600 dark:text-slate-300">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wider">
              <tr>
                {[
                  "Sr. No.",
                  "Customer",
                  "Total",
                  "Payment",
                  "Coupon",
                  "Status",
                  "Date",
                ].map((heading, i) => (
                  <th key={i} className="px-4 py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-150 cursor-pointer"
                  onClick={() => openModal(order)}
                >
                  <td className="pl-6 text-green-600 dark:text-green-400">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">{order.user?.name}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                    ${order.total}
                  </td>
                  <td className="px-4 py-3">{order.paymentMethod}</td>
                  <td className="px-4 py-3">
                    {order.isCouponUsed ? (
                      <span className="bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full">
                        {order.coupon?.code}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">
                        no coupon
                      </span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(
                          order.id,
                          e.target.value as OrderStatus,
                        )
                      }
                      className="border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md text-sm focus:ring focus:ring-blue-200 dark:focus:ring-blue-900"
                    >
                      <option value="ORDER_PLACED">ORDER_PLACED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedOrder && (
        <div
          onClick={closeModal}
          className="fixed inset-0 flex items-center justify-center bg-black/50 text-slate-700 dark:text-slate-200 text-sm backdrop-blur-xs z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-2xl w-full p-6 relative border border-transparent dark:border-slate-700"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">
              Order Details
            </h2>

            {/* Customer Details */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">
                Customer Details
              </h3>
              <p>
                <span className="text-green-700 dark:text-green-400">
                  Name:
                </span>{" "}
                {selectedOrder.user?.name}
              </p>
              <p>
                <span className="text-green-700 dark:text-green-400">
                  Email:
                </span>{" "}
                {selectedOrder.user?.email}
              </p>
              <p>
                <span className="text-green-700 dark:text-green-400">
                  Phone:
                </span>{" "}
                {selectedOrder.address?.phone}
              </p>
              <p>
                <span className="text-green-700 dark:text-green-400">
                  Address:
                </span>{" "}
                {`${selectedOrder.address?.street}, ${selectedOrder.address?.city}, ${selectedOrder.address?.state}, ${selectedOrder.address?.zip}, ${selectedOrder.address?.country}`}
              </p>
            </div>

            {/* Products */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">
                Products
              </h3>
              <div className="space-y-2">
                {selectedOrder.orderItems.map((item, i) => {
                  const firstImage = item.product.images?.[0];
                  const imageSrc =
                    typeof firstImage === "string"
                      ? firstImage
                      : firstImage?.src;

                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 border border-slate-100 dark:border-slate-700 shadow rounded p-2"
                    >
                      {imageSrc && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageSrc}
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-slate-800 dark:text-slate-100">
                          {item.product?.name}
                        </p>
                        <p>Qty: {item.quantity}</p>
                        <p>Price: ${item.price}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment & Status */}
            <div className="mb-4">
              <p>
                <span className="text-green-700 dark:text-green-400">
                  Payment Method:
                </span>{" "}
                {selectedOrder.paymentMethod}
              </p>
              <p>
                <span className="text-green-700 dark:text-green-400">
                  Paid:
                </span>{" "}
                {selectedOrder.isPaid ? "Yes" : "No"}
              </p>
              {selectedOrder.isCouponUsed && selectedOrder.coupon && (
                <p>
                  <span className="text-green-700 dark:text-green-400">
                    Coupon:
                  </span>{" "}
                  {selectedOrder.coupon.code} ({selectedOrder.coupon.discount}%
                  off)
                </p>
              )}
              <p>
                <span className="text-green-700 dark:text-green-400">
                  Status:
                </span>{" "}
                {selectedOrder.status}
              </p>
              <p>
                <span className="text-green-700 dark:text-green-400">
                  Order Date:
                </span>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
