"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getBookings, updateBookingStatus, Booking } from "@/lib/api/bookings"
import { getItem, Item } from "@/lib/api/items"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Calendar, Package, ArrowRight } from "lucide-react"

export default function MyRentalsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<(Booking & { item?: Item })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchBookings = async () => {
      setLoading(true)
      try {
        const data = await getBookings(user.uid, "renter")
        // Fetch item details for each booking
        const enhancedData = await Promise.all(
          data.map(async (b) => {
            const item = await getItem(b.itemId)
            return { ...b, item: item || undefined }
          })
        )
        setBookings(enhancedData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [user])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b bg-background/60 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="text-sm font-medium">My Rentals</div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 bg-muted/10 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Your Rental Journey</h1>

            <Tabs defaultValue="renting" className="w-full">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-muted/50 rounded-xl p-1">
                <TabsTrigger value="renting" className="rounded-lg">Rented by Me</TabsTrigger>
                <TabsTrigger value="lending" className="rounded-lg">Lent by Me</TabsTrigger>
              </TabsList>

              <TabsContent value="renting" className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="grid gap-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <CardContent className="p-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
                          <div className="p-4 flex gap-4 flex-1">
                             <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                               {booking.item?.images?.[0] ? (
                                 <img src={booking.item.images[0]} className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                               )}
                             </div>
                             <div className="flex flex-col justify-center">
                               <h3 className="font-bold text-lg">{booking.item?.name || "Unknown Item"}</h3>
                               <p className="text-sm text-muted-foreground capitalize">{booking.item?.category}</p>
                             </div>
                          </div>
                          
                          <div className="p-4 flex flex-col justify-center gap-2 bg-muted/20 min-w-[250px]">
                             <div className="flex items-center gap-2 text-sm">
                               <Calendar className="h-4 w-4 text-primary" />
                               <span>{new Date(booking.startDate?.seconds * 1000).toLocaleDateString()}</span>
                               <ArrowRight className="h-3 w-3 text-muted-foreground" />
                               <span>{new Date(booking.endDate?.seconds * 1000).toLocaleDateString()}</span>
                             </div>
                             <div className="flex items-center justify-between mt-1">
                               <span className="font-bold text-lg">${booking.totalFee} Total</span>
                               <Badge variant={booking.status === "active" ? "default" : "secondary"} className="capitalize">
                                 {booking.status}
                               </Badge>
                             </div>
                          </div>

                          <div className="p-4 flex items-center justify-center gap-2">
                             <Button variant="outline" size="sm">Details</Button>
                             {booking.status === "pending" && (
                               <Button variant="destructive" size="sm">Cancel</Button>
                             )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-2xl bg-muted/20">
                     <Package className="h-8 w-8 text-muted-foreground mb-2" />
                     <p className="text-muted-foreground">You haven't rented anything yet.</p>
                     <Button variant="link" asChild><Link href="/discover">Start browsing</Link></Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="lending">
                 <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-2xl bg-muted/20">
                     <p className="text-muted-foreground">Lending dashboard coming soon.</p>
                     <Button variant="outline" className="mt-4" asChild><Link href="/rent-out">List an item</Link></Button>
                  </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
