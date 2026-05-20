import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Plus, Search, Star } from "lucide-react";

import { Logo } from "@repo/ui/logo";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { ThemeToggle } from "@repo/ui/theme-toggle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Avatar, AvatarFallback } from "@repo/ui/avatar";
import { Separator } from "@repo/ui/separator";
import { Switch } from "@repo/ui/switch";
import { Checkbox } from "@repo/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";

export const Route = createFileRoute("/showcase")({ component: Showcase });

function Showcase() {
  const [tab, setTab] = useState("buttons");

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background px-8">
          <div className="flex items-center gap-3">
            <Logo variant="wordmark" className="h-7" />
            <Badge variant="brand">Design system</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-4" />
              <Input placeholder="Search…" className="h-9 w-64 pl-9" />
            </div>
            <ThemeToggle />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell />
                </Button>
              </TooltipTrigger>
              <TooltipContent>3 new updates</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_rgba(89,95,174,0.25)]">
                  <Avatar className="size-9">
                    <AvatarFallback>AL</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>ada@university.edu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Profile
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Saved boards</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-5xl px-8 pt-12 pb-8">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground mb-2">@repo/ui</p>
          <h1 className="text-4xl mb-3">
            Primitives for the <span className="marker-hl">Whiteboard</span> app
          </h1>
          <p className="text-lg font-medium text-ink-3 max-w-2xl">
            shadcn-style, Radix-powered, Tailwind v4. All wired to the Whiteboard design tokens — brand violet (
            <code className="font-mono text-sm">#595FAE</code>) and Quicksand.
          </p>
        </section>

        {/* Tabs */}
        <section className="mx-auto max-w-5xl px-8 pb-24">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="surfaces">Surfaces</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="buttons">
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                  <CardDescription>Six variants × four sizes.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button>Sign in</Button>
                    <Button variant="secondary">Cancel</Button>
                    <Button variant="tonal">Add note</Button>
                    <Button variant="ghost">Skip</Button>
                    <Button variant="destructive">Delete</Button>
                    <Button variant="link">Read more</Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button>Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon" aria-label="New">
                      <Plus />
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button>
                      <Plus /> New board
                    </Button>
                    <Button variant="secondary">
                      <Star /> Star
                    </Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forms">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sign in</CardTitle>
                    <CardDescription>Form built with Input + Label + Button.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@university.edu" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pw">Password</Label>
                      <Input id="pw" type="password" placeholder="••••••••" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="remember" defaultChecked />
                      <Label htmlFor="remember" className="font-medium">
                        Remember me
                      </Label>
                    </div>
                    <Button className="w-full">Sign in</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Board settings</CardTitle>
                    <CardDescription>Switch · Select · Textarea.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label>Paper style</Label>
                      <Select defaultValue="dotted">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blank">Blank</SelectItem>
                          <SelectItem value="dotted">Dotted</SelectItem>
                          <SelectItem value="graph">Graph</SelectItem>
                          <SelectItem value="lines">Lines</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="block">Show grid by default</Label>
                        <p className="text-xs text-muted-foreground mt-1">A faint dot grid behind every new board.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="about">About</Label>
                      <Textarea id="about" placeholder="Tell us about this board…" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="surfaces">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Algorithms — week 3", "Linear algebra", "Persuasive essay"].map((title, i) => (
                  <Card key={title}>
                    <CardHeader>
                      <CardTitle>{title}</CardTitle>
                      <CardDescription>Updated {i + 1}h ago</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={i === 0 ? "brand" : "default"}>Boards</Badge>
                        {i === 1 && <Badge variant="success">Submitted</Badge>}
                        {i === 2 && <Badge variant="warning">Due soon</Badge>}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="secondary" size="sm">
                        Open
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                      <Button variant="ghost" size="sm">
                        <Star /> Star
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="feedback">
              <Card>
                <CardHeader>
                  <CardTitle>Dialog & badges</CardTitle>
                  <CardDescription>Modals, semantic chips, and the marker highlight motif.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="brand">Brand</Badge>
                    <Badge variant="success">Submitted</Badge>
                    <Badge variant="warning">Due soon</Badge>
                    <Badge variant="danger">Overdue</Badge>
                    <Badge variant="info">Beta</Badge>
                    <Badge variant="marker">Highlight</Badge>
                    <Badge variant="ink">Ink</Badge>
                  </div>
                  <Separator />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary">Open dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete board?</DialogTitle>
                        <DialogDescription>
                          This will permanently remove the board and every doodle on it. You can&apos;t undo this.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="ghost">Cancel</Button>
                        <Button variant="destructive">Delete</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </TooltipProvider>
  );
}
