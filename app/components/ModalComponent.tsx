"use client";
import React, { useRef, JSX } from "react";

interface ModalComponentProps {
  title: string;
  body: string | JSX.Element;
  button1?: string;
  button2?: string;
  open: boolean;
  onClose: (buttonIndex: number) => void;
}

export default function ModalComponent({
  title,
  body,
  button1,
  button2,
  open,
  onClose,
}: ModalComponentProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    if (open && dialog.current) {
      dialog.current.showModal();
    } else if (dialog.current) {
      dialog.current.close();
    }
  }, [open]);

  return (
    <>
      <dialog id="my_modal_1" className="modal" ref={dialog}>
        <div className="modal-box">
          <h3 className="font-bold text-xl">{title}</h3>
          {typeof body === "string" ? <p className="py-4">{body}</p> : body}
          <div className="modal-action justify-center">
            <form method="dialog" className="flex gap-4">
              <button className="btn btn-primary font-montserrat" onClick={() => onClose(0)}>
                {button1 || "OK"}
              </button>
              {button2 && (
                <button className="btn font-montserrat" onClick={() => onClose(1)}>
                  {button2}
                </button>
              )}
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
