import type { BlogTableDataIntrf } from '@/models/blogModel';
import { TableCell, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Eraser, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BlogTable(props: BlogTableDataIntrf) {
    const navigate = useNavigate();

    return (
        <TableRow>
            <TableCell className="font-medium">{new Date(props.blog.created_at).toLocaleString()}</TableCell>
            <TableCell>{props.blog.title}</TableCell>
            <TableCell className='flex gap-2'>
                <Button 
                    disabled={props.is_processing}
                    onClick={() => props.on_delete.mutate(props.blog._id)}
                    size={"icon"}
                    variant={"outline"} 
                >
                    <Eraser size={22}/>
                </Button>
                <Button 
                    disabled={props.is_processing}
                    onClick={() => navigate(`/blogs/update/${props.blog._id}`)}
                    variant={"outline"} 
                    size={"icon"}
                >
                    <Pencil size={22}/>
                </Button>
            </TableCell>
        </TableRow>
    );
}