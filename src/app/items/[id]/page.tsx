"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getItem, Item } from "@/lib/api/items"
import { createBooking } from "@/lib/api/bookings"
import { useAuth } from "@/hooks/use-auth"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays, differenceInDays } from "date-fns"
import { Calendar, Star, ShieldCheck, Truck, MessageCircle, AlertCircle, Loader2 } from "lucide-react"

export default function ItemDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [date, setDate] = useState<{ from: Date; to: Date } | undefined>()

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await getItem(id as string)
        setItem(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [id])

  const totalDays = date?.from && date?.to ? differenceInDays(date.to, date.from) + 1 : 0
  const totalPrice = item ? totalDays * item.pricePerDay : 0

  const handleBooking = async () => {
    if (!user) {
      router.push("/login")
      return
    }
    if (!date?.from || !date?.to) return

    setBookingLoading(true)
    try {
      await createBooking({
        renterId: user.uid,
        ownerId: item!.ownerId,
        itemId: item!.id!,
        startDate: date.from,
        endDate: date.to,
        totalFee: totalPrice,
      })
      router.push("/my-rentals")
    } catch (err) {
      console.error(err)
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (!item) return (
    <div className="flex h-screen items-center justify-center text-center p-6">
      <div>
        <h1 className="text-2xl font-bold">Item not found</h1>
        <p className="text-muted-foreground mt-2">The item you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-4" onClick={() => router.push("/discover")}>Back to Discover</Button>
      </div>
    </div>
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b bg-background/60 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="text-sm font-medium">Item Details</div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 bg-muted/10 overflow-auto">
          <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-12">
            
            {/* Left: Images & Content */}
            <div className="lg:col-span-7 space-y-8">
              <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-muted shadow-sm ring-1 ring-border">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image Available</div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none capitalize px-3 py-1">
                    {item.category}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {item.averageRating || "5.0"}
                    <span className="text-muted-foreground font-normal">({item.reviewsCount} reviews)</span>
                  </div>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">{item.name}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>

              <Separator />

              <div className="grid sm:grid-cols-2 gap-6">
                 <div className="flex items-start gap-4 p-4 rounded-2xl bg-background shadow-sm ring-1 ring-border">
                    <ShieldCheck className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-bold">Rental Protection</h4>
                      <p className="text-sm text-muted-foreground">This item is covered by our accidental damage protection plan.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 rounded-2xl bg-background shadow-sm ring-1 ring-border">
                    <Truck className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-bold">Fast Handover</h4>
                      <p className="text-sm text-muted-foreground">Owner usually responds within 2 hours for pickup arrangements.</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right: Booking Card */}
            <div className="lg:col-span-5">
              <div className="sticky top-24">
                <Card className="border-none shadow-2xl bg-background/80 backdrop-blur-xl ring-1 ring-primary/10 rounded-3xl overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black">${item.pricePerDay}</span>
                      <span className="text-muted-foreground font-semibold">/ day</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                       <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground ml-1">Select Dates</Label>
                       <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal h-12 rounded-xl bg-muted/30 border-none">
                            <Calendar className="mr-2 h-4 w-4 text-primary" />
                            {date?.from ? (
                              date.to ? (
                                <>
                                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(date.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick your rental dates</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            initialFocus
                            mode="range"
                            // @ts-ignore
                            selected={date}
                            // @ts-ignore
                            onSelect={setDate}
                            numberOfMonths={2}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {totalDays > 0 && (
                      <div className="space-y-3 p-4 rounded-2xl bg-primary/5 ring-1 ring-primary/10 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between text-sm">
                          <span>${item.pricePerDay} x {totalDays} days</span>
                          <span className="font-bold">${totalPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Service fee</span>
                          <span className="font-bold text-green-600">Free</span>
                        </div>
                        <Separator className="bg-primary/10" />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span className="text-primary">${totalPrice}</span>
                        </div>
                      </div>
                    )}

                    <Button 
                      className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                      onClick={handleBooking}
                      disabled={!date?.from || !date?.to || bookingLoading}
                    >
                      {bookingLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Request to Rent"}
                    </Button>
                    
                    <p className="text-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                      Zero commitment until owner approves
                    </p>

                    <Separator />

                    <div className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
                             <img src="https://github.com/shadcn.png" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">John Doe</p>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                               <ShieldCheck className="h-3 w-3 text-green-600" />
                               Verified Pro
                            </div>
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" className="group-hover:text-primary transition-colors">
                          <MessageCircle className="h-5 w-5" />
                       </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-4 flex items-start gap-3 p-4 text-xs text-muted-foreground leading-relaxed">
                   <AlertCircle className="h-4 w-4 flex-shrink-0" />
                   Review our rental policy to understand refund conditions before booking.
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
