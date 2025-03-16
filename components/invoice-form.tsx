"use client"

import type React from "react"

import { useState } from "react"
import type { InvoiceData, InvoiceItem } from "./invoice-generator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface InvoiceFormProps {
  invoiceData: InvoiceData
  onUpdateInvoice: (data: Partial<InvoiceData>) => void
}

const colorThemes = [
  { id: "blue", name: "Blue", color: "bg-blue-500" },
  { id: "green", name: "Green", color: "bg-green-500" },
  { id: "purple", name: "Purple", color: "bg-purple-500" },
  { id: "red", name: "Red", color: "bg-red-500" },
  { id: "orange", name: "Orange", color: "bg-orange-500" },
]

export function InvoiceForm({ invoiceData, onUpdateInvoice }: InvoiceFormProps) {
  const [customLogo, setCustomLogo] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    onUpdateInvoice({ [name]: value })
  }

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setCustomLogo(result)
        onUpdateInvoice({ companyLogo: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = invoiceData.items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [field]: typeof value === "string" && field !== "description" ? Number.parseFloat(value) || 0 : value,
        }
      }
      return item
    })
    onUpdateInvoice({ items: updatedItems })
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: uuidv4(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      tax: 0,
      discount: 0,
    }
    onUpdateInvoice({ items: [...invoiceData.items, newItem] })
  }

  const removeItem = (id: string) => {
    if (invoiceData.items.length <= 1) return
    const updatedItems = invoiceData.items.filter((item) => item.id !== id)
    onUpdateInvoice({ items: updatedItems })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-medium text-lg">Company Information</h3>

          <div>
            <Label htmlFor="companyName" className="text-sm">
              Company Name
            </Label>
            <Input
              id="companyName"
              name="companyName"
              value={invoiceData.companyName}
              onChange={handleInputChange}
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <Label htmlFor="companyAddress" className="text-sm">
              Company Description
            </Label>
            <Textarea
              id="companyAddress"
              name="companyAddress"
              value={invoiceData.companyAddress}
              onChange={handleInputChange}
              placeholder="Company Description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="companyLogo" className="text-sm">
              Company Logo
            </Label>
            <Input id="companyLogo" type="file" accept="image/*" onChange={handleCustomLogoUpload} className="w-full" />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-medium text-lg">Client Information</h3>

          <div>
            <Label htmlFor="clientName" className="text-sm">
              Client Name
            </Label>
            <Input
              id="clientName"
              name="clientName"
              value={invoiceData.clientName}
              onChange={handleInputChange}
              placeholder="Client Name"
            />
          </div>

          <div>
            <Label htmlFor="clientAddress" className="text-sm">
              Client Description
            </Label>
            <Textarea
              id="clientAddress"
              name="clientAddress"
              value={invoiceData.clientAddress}
              onChange={handleInputChange}
              placeholder="Client Description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber" className="text-sm">
                Invoice Number
              </Label>
              <Input
                id="invoiceNumber"
                name="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={handleInputChange}
                placeholder="INV-001"
              />
            </div>

            <div>
              <Label htmlFor="colorTheme" className="text-sm">
                Color Theme
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {colorThemes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    className={`w-full h-8 rounded-md ${theme.color} ${
                      invoiceData.colorTheme === theme.id ? "ring-2 ring-offset-2 ring-black dark:ring-white" : ""
                    }`}
                    onClick={() => onUpdateInvoice({ colorTheme: theme.id })}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceDate" className="text-sm">
                Invoice Date
              </Label>
              <Input
                id="invoiceDate"
                name="invoiceDate"
                type="date"
                value={invoiceData.invoiceDate}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="dueDate" className="text-sm">
                Due Date
              </Label>
              <Input id="dueDate" name="dueDate" type="date" value={invoiceData.dueDate} onChange={handleInputChange} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-lg">Invoice Items</h3>
          <Button type="button" onClick={addItem} size="sm" className="flex items-center gap-1">
            <Plus size={16} /> Add Item
          </Button>
        </div>

        {invoiceData.items.map((item, index) => (
          <Card key={item.id} className="mb-4">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4">
                <div className="md:col-span-5">
                  <Label htmlFor={`item-${item.id}-description`} className="text-sm">
                    Description
                  </Label>
                  <Input
                    id={`item-${item.id}-description`}
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                    placeholder="Item description"
                  />
                </div>

                <div className="md:col-span-1">
                  <Label htmlFor={`item-${item.id}-quantity`} className="text-sm">
                    Qty
                  </Label>
                  <Input
                    id={`item-${item.id}-quantity`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`item-${item.id}-unitPrice`} className="text-sm">
                    Price
                  </Label>
                  <Input
                    id={`item-${item.id}-unitPrice`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(item.id, "unitPrice", e.target.value)}
                  />
                </div>

                <div className="md:col-span-1">
                  <Label htmlFor={`item-${item.id}-tax`} className="text-sm">
                    Tax %
                  </Label>
                  <Input
                    id={`item-${item.id}-tax`}
                    type="number"
                    min="0"
                    max="100"
                    value={item.tax}
                    onChange={(e) => handleItemChange(item.id, "tax", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`item-${item.id}-discount`} className="text-sm">
                    Discount %
                  </Label>
                  <Input
                    id={`item-${item.id}-discount`}
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount}
                    onChange={(e) => handleItemChange(item.id, "discount", e.target.value)}
                  />
                </div>

                <div className="md:col-span-1 flex items-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={invoiceData.items.length <= 1}
                    className="w-full h-10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Label htmlFor="notes" className="text-sm">
          Notes
        </Label>
        <Textarea
          id="notes"
          name="notes"
          value={invoiceData.notes}
          onChange={handleInputChange}
          placeholder="Additional notes or payment instructions"
          rows={3}
        />
      </div>
    </div>
  )
}

