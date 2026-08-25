type AlertType = {
    message: string;
}

export default function Alert(props: AlertType) {
    return (
        <div className="fixed top-6 left-1/2 w-full z-40 flex justify-center">
            <div className="bg-white flex justify-center items-center min-w-75 max-w-[90%] border-black border rounded-lg p-4 shadow-2xl">
                <div className="font-medium text-gray-700 text-xl text-center">
                    {props.message}
                </div>
            </div>
        </div>
    );
}