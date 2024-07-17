import React from "react";
import ReactDOM from "react-dom";
import styles from "./Modal.module.css";
import { ModalProps } from "../../types/allTypesAndInterfaces";
import { useUIContext } from "../../context/UIContext";

function Modal(props: ModalProps) {
  const { children, darkBackground = false, isSmaller = false } = props;
  const { closeModal, isModalOpen } = useUIContext();

  if (!isModalOpen) {
    return null;
  }

  function handleOverlayClick() {
    closeModal(); // Close the modal when clicking outside the content
  }

  function handleContentClick(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation(); // Prevent closing when clicking inside the content
  }

  return ReactDOM.createPortal(
    <div
      className={`${styles.modalOverlay} ${
        darkBackground ? styles.darkBackground : ""
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`${styles.modalContent} ${
          isSmaller ? styles.smallerContainer : ""
        }`}
        onClick={handleContentClick}
      >
        <button
          className={styles.closeButton}
          onClick={closeModal}
          aria-label="Close modal"
        >
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
