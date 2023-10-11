import React from 'react';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgb(251, 251, 251)',
    border: 0,
    borderRadius: 10,
    boxShadow: '0px 0px 7px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s',
    overflow: 'visible',
  },
  overlay: { zIndex: 1000 },
};

interface IModalProps {
  title: string | React.ReactChild;
  isOpen: boolean;
  header?: React.ReactElement | React.ReactElement[] | string | null;
  children: React.ReactElement | React.ReactElement[] | string | null;
  onClose: (e?: React.MouseEvent) => void;
}

function ModalComponent({
  title,
  isOpen,
  header,
  children,
  onClose,
}: IModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => onClose()}
      contentLabel={typeof title === 'string' ? title : ''}
      style={customStyles}
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: 'calc(100% - 20px) 20px' }}
      >
        <div>{header}</div>
        <div>
          <span className="vertical-align-top">
            <span
              onClick={onClose}
              className="w-5 h-5 text-white font-medium cursor-pointer inline-block bg-blue-600 rounded-full text-sm flex justify-center items-center"
            >
              ✕
            </span>
          </span>
        </div>
      </div>
      {/* <JoyrideComp /> */}
      {children}
    </Modal>
  );
}

export default ModalComponent;
