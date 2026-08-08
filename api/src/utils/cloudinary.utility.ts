import { v2 } from "cloudinary";
import { Readable } from "stream";

export interface CloudinaryUploadResult {
    filename: string;
    filetype: string;
    public_id: string;
    resource_type: string;
    url: string;
}

export interface CloudinaryUploadOption {
    file_buffer: Buffer;
    foldername: string;
    mimetype: string;
    original_name: string;
}

export async function uploadToCloudinary(props: CloudinaryUploadOption): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
        const publicId = `${Date.now()}_${props.original_name}`;
        const uploadStream = v2.uploader.upload_stream({
            folder: props.foldername,
            public_id: publicId,
            resource_type: "auto"
        }, (error, result) => {
            if (error) {
                reject(new Error("failed to upload to cloudinary"));
                return;
            }

            if (!result) {
                reject(new Error("No response returned from cloudinary"));
                return;
            }

            resolve({
                filename: props.original_name,
                filetype: props.mimetype,
                public_id: result.public_id,
                resource_type: result.resource_type,
                url: result.url
            });
        });

        const readableStream = new Readable();
        readableStream.push(props.file_buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
}