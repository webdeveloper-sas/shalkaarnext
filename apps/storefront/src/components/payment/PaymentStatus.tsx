"use client";

interface PaymentStatusProps {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  orderId?: string;
}

export default function PaymentStatus({
  isLoading,
  isSuccess,
  isError,
  errorMessage,
  orderId,
}: PaymentStatusProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Processing your payment...</p>
        <p className="text-gray-500 text-sm mt-2">Please do not refresh this page</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Payment Successful!
            </h3>
            <p className="text-green-800 text-sm mb-2">
              Your order has been placed successfully.
            </p>
            {orderId && (
              <p className="text-green-700 font-medium text-sm">
                Order ID: <span className="font-mono">{orderId}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Payment Failed
            </h3>
            <p className="text-red-800 text-sm">
              {errorMessage || "An error occurred while processing your payment. Please try again."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
