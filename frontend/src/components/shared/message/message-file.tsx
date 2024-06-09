import { fileUrl, isImage, isVideo } from "@/lib/utils";
import { Package } from "lucide-react";
import { Message } from "typings";

const Video = ({ file }: { file: any }) => {
    return (
        <video
            src={fileUrl(file)}
            controls
            className="max-w-80"
        />
    );
}

const OtherFile = ({ file }: { file: any }) => {
    return (
        <div
            onClick={() => {
                window.open(fileUrl(file));
            }}
            className="flex items-center justify-center flex-col">
            <Package size={75} />

            <p className="text-xs text-center text-gray-500 truncate w-28"><b>{file.name}</b></p>

            <p className="text-xs text-center text-gray-500 w-28">
                <b className="">
                    {(file.size / (1024 * 1024)).toFixed(2)} mb.
                </b>
            </p>

        </div>
    )
}

const File = ({ file }: { file: any }) => {
    if (isVideo(file.url)) {
        return <Video file={file} />
    }

    if (isImage(file.url)) {
        return <img src={fileUrl(file)} alt={file.name} className="max-w-80" />
    }

    return <OtherFile file={file} />
}


const MessageFile = ({
    message
}: { message: Message }) => {

    return (
        <div>
            {message.file?.map((file) => (
                <div key={file.id}>
                    <File file={file} />
                </div>
            ))}
        </div>
    );
}

export default MessageFile;