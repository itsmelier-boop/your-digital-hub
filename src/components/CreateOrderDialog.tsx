import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const orderSchema = z.object({
  orderCode: z.string().max(50, "Order code must be less than 50 characters").optional(),
  orderTitle: z
    .string()
    .trim()
    .min(1, "Order title is required")
    .max(100, "Order title must be less than 100 characters"),
  orderDescription: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: (order: {
    id: string;
    name: string;
    description: string;
    status: string;
    items: number;
    amount: string;
    createdDate: string;
  }) => void;
}

export const CreateOrderDialog = ({
  open,
  onOpenChange,
  onOrderCreated,
}: CreateOrderDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderCode: "",
      orderTitle: "",
      orderDescription: "",
    },
  });

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newOrder = {
        id: data.orderCode || `ORD-${Date.now()}`,
        name: data.orderTitle,
        description: data.orderDescription || "",
        status: "Active",
        items: 0,
        amount: "₹0",
        createdDate: new Date().toLocaleDateString("en-GB"),
      };

      onOrderCreated(newOrder);

      toast({
        title: "Order created",
        description: `${data.orderTitle} has been successfully created.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Add a new order to this project.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="orderCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., PO-2024-001"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Main Construction Work"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description of the work to be done..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
