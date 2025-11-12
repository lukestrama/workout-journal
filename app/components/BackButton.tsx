import React from "react";
import Link from "next/link";

interface BackButtonProps {
    classNames?: string
}

const BackButton = ({ classNames}: BackButtonProps): React.ReactNode => {
  return (
    <Link href="/" className={`flex items-center justify-between ${classNames}`}>
      <i className="fa-solid fa-chevron-left text-2xl"></i>
    </Link>
  );
};

export default BackButton;
