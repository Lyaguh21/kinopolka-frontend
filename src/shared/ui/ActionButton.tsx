import {
  Button,
  type ButtonProps,
  type ElementProps,
  type PolymorphicComponentProps,
} from "@mantine/core";
import { motion, useReducedMotion } from "motion/react";
import classes from "./ActionButton.module.css";

type ActionButtonProps = Omit<ButtonProps, "variant"> &
  ElementProps<"button", keyof ButtonProps> & {
    appearance?: "primary" | "secondary";
    renderRoot?: PolymorphicComponentProps<"button", ButtonProps>["renderRoot"];
  };

export function ActionButton({
  appearance = "primary",
  className,
  fullWidth,
  ...props
}: ActionButtonProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.span
      className={classes.wrap}
      style={fullWidth ? { width: "100%" } : undefined}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.12 }}
    >
      <Button
        {...props}
        fullWidth={fullWidth}
        data-appearance={appearance}
        className={[classes.button, className].filter(Boolean).join(" ")}
      />
    </motion.span>
  );
}
