import React from "react";

const variantClassNames = {
  auth: "h-24 w-auto object-contain mx-auto mb-6",
  navbar: "h-10 w-auto object-contain",
  sidebar: "h-10 w-auto object-contain",
};

export default function Logo({
  alt = "Visa Matrix",
  className = "",
  variant = "navbar",
  ...props
}) {
  const classes = [variantClassNames[variant] ?? variantClassNames.navbar, className]
    .filter(Boolean)
    .join(" ");

  return <img {...props} className={classes} src="/logo.png" alt={alt} />;
}
