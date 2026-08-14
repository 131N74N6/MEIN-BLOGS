import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Blogs() {
    return (
        <div className="h-screen">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Blog Title</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.invoice}>
                            <TableCell className="font-medium">{invoice.invoice}</TableCell>
                            <TableCell>{invoice.paymentStatus}</TableCell>
                            <TableCell>{invoice.paymentMethod}</TableCell>
                            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">$2,500.00</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}