import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { formatPrice } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound } from "next/navigation";
import StatusDropdown from "./StatusDropdown";

const Page = async () => {
  // Get user and check if authenticated
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  if (!user || user.email !== ADMIN_EMAIL) {
    return notFound();
  }

  const WEEKLY_GOAL = 15000;
  const MONTHLY_GOAL = 60000;

  // Get orders to deliver (only paid)
  const orders = await db.order.findMany({
    where: {
      isPaid: true,
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      shippingAddress: true,
    },
  });

  const lastWeekSum = await db.order.aggregate({
    where: {
      isPaid: true,
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        // .getDate() returns the date(only day) of the month
        // .setDate() method modifies the existing Date object rather than creating a new one.
      },
    },

    _sum: {
      // _sum : prisma property
      amount: true,
    },
  });

  const lastMonthSum = await db.order.aggregate({
    where: {
      isPaid: true,
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    },
    _sum: {
      amount: true,
    },
  });

  return (
    // <div className="flex min-h-screen w-full bg-muted/40">
    <div className="max-w-7xl w-full mx-auto flex flex-col sm:gap-4 sm:p-4 min-h-screen bg-muted/40">
      <div className="flex flex-col gap-12">
        {/* Goal cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Weekly goal card */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Revenue Last Week</CardDescription>
              <CardTitle className="text-3xl">
                {formatPrice(lastWeekSum._sum.amount ?? 0)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                of {formatPrice(WEEKLY_GOAL)} weekly goal
              </div>
            </CardContent>
            <CardFooter>
              <Progress
                value={((lastWeekSum._sum.amount ?? 0) * 100) / WEEKLY_GOAL} //value % goal = sum
              />
            </CardFooter>
          </Card>
          {/* Monthly goal card  */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Revenue Last Month</CardDescription>
              <CardTitle className="text-3xl">
                {formatPrice(lastMonthSum._sum.amount ?? 0)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                of {formatPrice(MONTHLY_GOAL)} monthly goal
              </div>
            </CardContent>
            <CardFooter>
              <Progress
                value={((lastMonthSum._sum.amount ?? 0) * 100) / MONTHLY_GOAL}
              />
            </CardFooter>
          </Card>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-center sm:text-left">
          Incoming orders
        </h1>

        {/* Orders table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden sm:table-cell">
                Order status
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                Purchase date
              </TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="bg-accent">
                <TableCell>
                  <div className="font-medium">
                    {order.shippingAddress?.name}
                  </div>
                  <div className="inline text-sm text-muted-foreground break-all">
                    {order.user.email}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <StatusDropdown id={order.id} orderStatus={order.status} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {order.createdAt.toLocaleDateString()}
                  {/* .toLocaleString() => formats date according to users locale format */}
                </TableCell>
                <TableCell className="text-right">
                  {formatPrice(order.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
    // </div>
  );
};

export default Page;
