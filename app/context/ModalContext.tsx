"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
} from "react";

interface ModalContextType {
  showModal: (content: ReactNode) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const modalRef = useRef<HTMLDialogElement | null>(null);

  const showModal = (content: ReactNode) => {
    setModalContent(null)
    setModalContent(content);
    modalRef.current?.showModal();
  };

  const hideModal = () => {
    setModalContent(null);
    modalRef.current?.close();
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box w-11/12 max-w-5xl h-3/4">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          {modalContent}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
