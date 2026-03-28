"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { addItem, uploadItemImage, updateItemImages } from "@/lib/api/items"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Loader2, Upload, X } from "lucide-react"

export default function RentOutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    pricePerDay: "",
  })

  if (!user) {
    router.push("/login")
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const itemId = await addItem({
        ownerId: user.uid,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        pricePerDay: parseFloat(formData.pricePerDay),
        images: [], // Will update later
        availabilityStatus: "available",
      })

      // Upload images if any
      const imageUrls = await Promise.all(
        images.map(file => uploadItemImage(file, itemId))
      )

      if (imageUrls.length > 0) {
        await updateItemImages(itemId, imageUrls)
      }
      
      router.push("/")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b bg-background/60 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="text-sm font-medium">Rent Out Item</div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 bg-muted/10 overflow-auto">
          <Card className="max-w-3xl mx-auto border-none shadow-xl bg-background/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">List Your Item</CardTitle>
              <CardDescription>Share your gear and start earning today.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Sony Alpha a7 IV Camera"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="tools">Tools & Equipment</SelectItem>
                          <SelectItem value="events">Party & Events</SelectItem>
                          <SelectItem value="home">Home & Garden</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price per Day ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        value={formData.pricePerDay}
                        onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your item, its condition, and any accessories included..."
                      className="min-h-[120px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Images</Label>
                    <div className="grid grid-cols-4 gap-4">
                      {images.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-lg border bg-muted overflow-hidden">
                          <img src={URL.createObjectURL(img)} alt="preview" className="object-cover w-full h-full" />
                          <button 
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-background/80 rounded-full p-1 shadow-sm hover:bg-background"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <label className="flex flex-col items-center justify-center aspect-square rounded-lg border border-dashed hover:bg-muted/50 cursor-pointer transition-colors">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-2">Upload</span>
                        <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "List Item"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
