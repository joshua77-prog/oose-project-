"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getItems, Item } from "@/lib/api/items"
import { Search, Bell, Truck, Package, DollarSign, Star, SlidersHorizontal, MapPin, Heart, Loader2, Sparkles } from "lucide-react"

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    activeRentals: 0,
    savings: 0,
    trustRating: 5.0,
    earnings: 0,
  })
  const [trendingItems, setTrendingItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        // Fetch active rentals
        const rentalsQuery = query(
          collection(db, "bookings"), 
          where("renterId", "==", user.uid),
          where("status", "==", "active")
        )
        const rentalsSnap = await getDocs(rentalsQuery)
        
        // Fetch user doc for trust and earnings
        const userDoc = await getDoc(doc(db, "users", user.uid))
        const userData = userDoc.data()

        // Fetch trending items (limit 4)
        const items = await getItems()
        setTrendingItems(items.slice(0, 4))

        setStats({
          activeRentals: rentalsSnap.size,
          savings: userData?.savings || 420,
          trustRating: userData?.trustRating || 5.0,
          earnings: userData?.lendingEarnings || 0,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, authLoading, router])

  if (authLoading || loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <div className="text-sm font-medium">Dashboard</div>
          </div>
          <div className="flex items-center gap-4 flex-1 max-w-xl mx-6">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Rent anything: cameras, drills, event tents..."
                className="w-full bg-muted/50 pl-10 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-none rounded-2xl h-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full border">
               <MapPin className="h-3 w-3 text-primary" />
               {/* @ts-ignore */}
               {user?.location || "New York, NY"}
             </div>
            <Button variant="ghost" size="icon" className="relative group">
              <Bell className="h-5 w-5 group-hover:text-primary transition-colors" />
              <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            </Button>
            <Avatar className="h-9 w-9 border-2 border-primary/10 hover:border-primary/40 transition-colors cursor-pointer">
              <AvatarImage src={user?.photoURL || "https://github.com/shadcn.png"} />
              <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-8 p-6 lg:p-10 bg-muted/10">
          <div className="flex flex-col gap-2">
             <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
               Welcome back, {user?.displayName?.split(" ")[0]}!
             </h1>
             <p className="text-muted-foreground text-lg max-w-2xl">
               Manage your rentals and explore what's trending in your area.
             </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-none shadow-sm bg-background/60 hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">My Active Rentals</CardTitle>
                <Package className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.activeRentals} Items</div>
                <p className="text-xs text-muted-foreground mt-1">Keep track of your gear</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-background/60 hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Rental Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${stats.savings}</div>
                <p className="text-xs text-green-600 font-medium mt-1">Total saved by renting</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-background/60 hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Trust Rating</CardTitle>
                <Star className="h-4 w-4 text-primary group-hover:scale-110 transition-transform fill-primary/10" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.trustRating}/5.0</div>
                <p className="text-xs text-muted-foreground mt-1">Super Renter status</p>
              </CardContent>
            </Card>
             <Card className="border-none shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer group relative overflow-hidden">
               <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-white/10 blur-2xl" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider opacity-80">Lending Earnings</CardTitle>
                <Truck className="h-4 w-4 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${stats.earnings}</div>
                <p className="text-xs opacity-80 mt-1">Great job, lender!</p>
              </CardContent>
            </Card>
          </div>

          {/* Featured / Trending Items */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Handpicked for You
                <Sparkles className="h-5 w-5 text-primary fill-primary/10" />
              </h2>
              <Button variant="link" onClick={() => router.push("/discover")} className="text-primary font-semibold">Browse all</Button>
            </div>
            
            {trendingItems.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {trendingItems.map((item) => (
                  <Link href={`/items/${item.id}`} key={item.id}>
                    <Card className="overflow-hidden border-none shadow-sm group hover:shadow-lg transition-all cursor-pointer">
                      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                        {item.images?.[0] ? (
                          <img 
                            src={item.images[0]} 
                            alt={item.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
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
                           <Button size="sm" className="h-8 px-4 rounded-lg">Rent Now</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="aspect-[4/3] rounded-2xl bg-muted/50 border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                      No trending items yet
                   </div>
                 ))}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
