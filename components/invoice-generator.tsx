"use client"

import { useState } from "react"
import { InvoiceForm } from "./invoice-form"
import { InvoicePreview } from "./invoice-preview"
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  tax: number
  discount: number
}

export interface InvoiceData {
  companyName: string
  companyAddress: string
  companyLogo: string
  clientName: string
  clientAddress: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  colorTheme: string
  items: InvoiceItem[]
  notes: string
}

export interface CurrencyData {
  code: string
  symbol: string
  rate: number
}

const defaultInvoiceData: InvoiceData = {
  companyName: "Your Company",
  companyAddress: "123 Business St, City, Country",
  companyLogo: "/placeholder.svg?height=80&width=200",
  clientName: "Client Name",
  clientAddress: "Client Address, City, Country",
  invoiceNumber: "001",
  invoiceDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  colorTheme: "blue",
  items: [
    {
      id: "1",
      description: "Service or Product",
      quantity: 1,
      unitPrice: 100,
      tax: 10,
      discount: 0,
    },
  ],
  notes: "Thank you for your business!",
}

const currencies: CurrencyData[] = [
  { code: "USD", symbol: "$", rate: 1 },
  { code: "EUR", symbol: "€", rate: 1 },
  { code: "GBP", symbol: "£", rate: 1 },
  { code: "JPY", symbol: "¥", rate: 1 },
  { code: "CAD", symbol: "C$", rate: 1 },
  { code: "LKR", symbol: "Rs.", rate: 1 },
]

export default function InvoiceGenerator() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(defaultInvoiceData)
  const [currency, setCurrency] = useState<CurrencyData>(currencies[0])
  const [activeTab, setActiveTab] = useState("edit")
  const { toast } = useToast()
  const isMobile = useMobile()

  const handleUpdateInvoice = (data: Partial<InvoiceData>) => {
    setInvoiceData((prev) => ({ ...prev, ...data }))
  }

  const handleCurrencyChange = (currencyCode: string) => {
    const newCurrency = currencies.find((c) => c.code === currencyCode)
    if (newCurrency) {
      setCurrency(newCurrency)
    }
  }

  const exportToPDF = async () => {
    const element = document.getElementById("invoice-preview")
    if (!element) return

    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we prepare your invoice...",
      })

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
      })

      const imgData = canvas.toDataURL("image/png")

      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // If image height is greater than PDF height, scale it down
      const finalImgHeight = Math.min(imgHeight, pdfHeight)
      const finalImgWidth = (canvas.width * finalImgHeight) / canvas.height

      // Center the image horizontally
      const xPosition = (pdfWidth - finalImgWidth) / 2

      pdf.addImage(imgData, "PNG", xPosition, 0, finalImgWidth, finalImgHeight)
      pdf.save(`Invoice-${invoiceData.invoiceNumber}.pdf`)

      toast({
        title: "PDF Generated",
        description: "Your invoice has been successfully exported as a PDF.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
      console.error("PDF generation error:", error)
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Invoice Generator</h1>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Currency:</span>
            <select
              className="border rounded p-2 bg-white dark:bg-gray-800"
              value={currency.code}
              onChange={(e) => handleCurrencyChange(e.target.value)}
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>
          <Button onClick={exportToPDF} className="bg-primary hover:bg-primary/90">
            Export to PDF
          </Button>
        </div>

        {isMobile ? (
          <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <InvoiceForm invoiceData={invoiceData} onUpdateInvoice={handleUpdateInvoice} />
            </TabsContent>
            <TabsContent value="preview">
              <InvoicePreview invoiceData={invoiceData} currency={currency} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
              <InvoiceForm invoiceData={invoiceData} onUpdateInvoice={handleUpdateInvoice} />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <InvoicePreview invoiceData={invoiceData} currency={currency} />
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}

