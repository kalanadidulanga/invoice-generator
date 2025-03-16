"use client"

import type { InvoiceData, CurrencyData } from "./invoice-generator"

interface InvoicePreviewProps {
  invoiceData: InvoiceData
  currency: CurrencyData
}

export function InvoicePreview({ invoiceData, currency }: InvoicePreviewProps) {
  const getThemeColor = () => {
    switch (invoiceData.colorTheme) {
      case "blue":
        return "bg-blue-500 text-white"
      case "green":
        return "bg-green-500 text-white"
      case "purple":
        return "bg-purple-500 text-white"
      case "red":
        return "bg-red-500 text-white"
      case "orange":
        return "bg-orange-500 text-white"
      default:
        return "bg-blue-500 text-white"
    }
  }

  const calculateSubtotal = (item: InvoiceData["items"][0]) => {
    return item.quantity * item.unitPrice
  }

  const calculateItemTotal = (item: InvoiceData["items"][0]) => {
    const subtotal = calculateSubtotal(item)
    const taxAmount = subtotal * (item.tax / 100)
    const discountAmount = subtotal * (item.discount / 100)
    return (subtotal + taxAmount - discountAmount) * currency.rate
  }

  const calculateInvoiceSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + calculateSubtotal(item), 0) * currency.rate
  }

  const calculateTotalTax = () => {
    return (
      invoiceData.items.reduce((sum, item) => {
        const subtotal = calculateSubtotal(item)
        return sum + subtotal * (item.tax / 100)
      }, 0) * currency.rate
    )
  }

  const calculateTotalDiscount = () => {
    return (
      invoiceData.items.reduce((sum, item) => {
        const subtotal = calculateSubtotal(item)
        return sum + subtotal * (item.discount / 100)
      }, 0) * currency.rate
    )
  }

  const calculateGrandTotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const formatCurrency = (amount: number) => {
    return `${currency.symbol}${amount.toFixed(2)}`
  }

  // Check if client details are empty
  const showClientSection = invoiceData.clientName.trim() !== "" || invoiceData.clientAddress.trim() !== ""

  return (
    <div id="invoice-preview" className="bg-white p-6 rounded-lg shadow-md max-w-[210mm] mx-auto text-[14px]">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div className="mb-4 md:mb-0">
          {invoiceData.companyLogo && (
            <div className="mb-4 max-w-[200px]">
              <img
                src={invoiceData.companyLogo || "/placeholder.svg"}
                alt={invoiceData.companyName}
                className="max-h-20 object-contain"
              />
            </div>
          )}
          <h2 className="text-base font-bold">{invoiceData.companyName}</h2>
          <p className="text-gray-600 whitespace-pre-line text-[12px]">{invoiceData.companyAddress}</p>
        </div>

        <div className="bg-gray-100 p-3 rounded-md">
          <h1 className="text-lg font-bold mb-1">INVOICE</h1>
          <div className="grid grid-cols-2 gap-x-4 text-[12px]">
            <span className="font-semibold">Invoice Number:</span>
            <span>{invoiceData.invoiceNumber}</span>

            <span className="font-semibold">Invoice Date:</span>
            <span>{new Date(invoiceData.invoiceDate).toLocaleDateString()}</span>

            <span className="font-semibold">Due Date:</span>
            <span>{new Date(invoiceData.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {showClientSection && (
        <div className="mb-6">
          <h3 className="text-gray-600 font-semibold mb-1 text-[12px]">Bill To:</h3>
          <h2 className="text-base font-bold">{invoiceData.clientName}</h2>
          <p className="text-gray-600 whitespace-pre-line text-[12px]">{invoiceData.clientAddress}</p>
        </div>
      )}

      <div className="mb-6">
        <div className={`grid grid-cols-12 ${getThemeColor()} rounded-t-md p-2 text-[12px] font-medium`}>
          <div className="col-span-5">Description</div>
          <div className="col-span-1 text-center">Qty</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-1 text-right">Tax</div>
          <div className="col-span-1 text-right">Disc</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>

        {invoiceData.items.map((item, index) => (
          <div
            key={item.id}
            className={`grid grid-cols-12 p-2 text-[12px] ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} border-b`}
          >
            <div className="col-span-5">{item.description}</div>
            <div className="col-span-1 text-center">{item.quantity}</div>
            <div className="col-span-2 text-right">{formatCurrency(item.unitPrice * currency.rate)}</div>
            <div className="col-span-1 text-right">{item.tax}%</div>
            <div className="col-span-1 text-right">{item.discount}%</div>
            <div className="col-span-2 text-right font-medium">{formatCurrency(calculateItemTotal(item))}</div>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 ml-auto w-full md:w-1/2 text-[12px]">
          <div className="text-right font-medium">Subtotal:</div>
          <div className="text-right">{formatCurrency(calculateInvoiceSubtotal())}</div>

          <div className="text-right font-medium">Tax:</div>
          <div className="text-right">{formatCurrency(calculateTotalTax())}</div>

          <div className="text-right font-medium">Discount:</div>
          <div className="text-right">-{formatCurrency(calculateTotalDiscount())}</div>

          <div className={`text-right font-bold ${getThemeColor().replace("bg-", "text-").replace(" text-white", "")}`}>
            TOTAL ({currency.code}):
          </div>
          <div
            className={`text-right font-bold text-[14px] ${getThemeColor().replace("bg-", "text-").replace(" text-white", "")}`}
          >
            {formatCurrency(calculateGrandTotal())}
          </div>
        </div>
      </div>

      {invoiceData.notes && (
        <div className="mt-6 border-t pt-3">
          <h3 className="text-[12px] font-semibold mb-1">Notes:</h3>
          <p className="text-gray-600 text-[12px]">{invoiceData.notes}</p>
        </div>
      )}
    </div>
  )
}

