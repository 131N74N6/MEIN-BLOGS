import type { BlogTableRowIntrf } from "@/models/blogModel";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./ui/table";
import BlogTable from "./BlogTable";
import { Button } from "./ui/button";
import Loading from "./ui/loading";

export default function BlogTableRow(props: BlogTableRowIntrf) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Blog Title</TableHead>
                    <TableHead>Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {props.blogs.map((blog) => (
                    <BlogTable 
                        blog={blog} 
                        is_processing={props.is_processing} 
                        on_delete={props.on_delete} 
                    />
                ))}
            </TableBody>
            <TableFooter>
                {props.blogs.length <= 16 ? null : props.has_next_page ? (
                    <TableRow>
                        <TableCell className="flex justify-center" colSpan={3}>
                            <Button 
                                disabled={props.is_processing}
                                onClick={() => props.fetch_next_page()}
                                type="button" 
                            >
                                Load More...
                            </Button>
                        </TableCell>
                    </TableRow>
                ) : props.is_fetching_next_page ? (
                    <TableRow>
                        <TableCell className="flex justify-center" colSpan={3}>
                            <Loading/>
                        </TableCell>
                    </TableRow>
                ) : (
                    <TableRow>
                        <TableCell className="flex justify-center" colSpan={3}>
                            <div className="text-center">No more blogs to show</div>
                        </TableCell>
                    </TableRow>
                )}
            </TableFooter>
        </Table>
    );
}