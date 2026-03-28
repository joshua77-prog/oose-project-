"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getItems, Item } from "@/lib/api/items"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, SlidersHorizontal, MapPin, Star, Heart, Loader2 } from "lucide-react"
import Link from "next/link"

export default function DiscoverPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category") || "all"
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      try {
        const data = await getItems(categoryParam)
        setItems(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [categoryParam])

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b bg-background/60 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm font-medium">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            Explore
            {categoryParam !== "all" && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <span className="capitalize text-primary">{categoryParam}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 flex-1 max-w-xl mx-6">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Search items..."
                className="w-full bg-muted/50 pl-10 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-none rounded-2xl h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </header>

        <main className="flex-1 p-6 lg:p-10 bg-muted/10 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading items...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item) => (
                <Link href={`/items/${item.id}`} key={item.id}>
                  <Card className="overflow-hidden border-none shadow-sm group hover:shadow-lg transition-all cursor-pointer">
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {item.images && item.images[0] ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/50">
                          No Image
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                         <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white text-muted-foreground hover:text-red-500">
                           <Heart className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold text-primary tracking-wider">{item.category}</span>
                        <div className="flex items-center gap-1">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold">{item.averageRating || "New"}</span>
                        </div>
                      </div>
                      <CardTitle className="text-base font-bold mb-1 group-hover:text-primary transition-colors line-clamp-1">{item.name}</CardTitle>
                      <div className="flex items-center justify-between mt-3">
                         <span className="text-lg font-bold">${item.pricePerDay}/day</span>
                         <Badge variant={item.availabilityStatus === "available" ? "default" : "secondary"}>
                           {item.availabilityStatus}
                         </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-xl font-semibold">No items found</p>
              <p className="text-muted-foreground mt-2">Try adjusting your search or category filter.</p>
              <Button variant="link" onClick={() => router.push("/discover")} className="mt-4">
                Clear all filters
              </Button>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
