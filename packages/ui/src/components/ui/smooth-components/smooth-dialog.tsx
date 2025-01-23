"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Transition, Variant } from "framer-motion";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";
import { useClickOutside } from "@shared/ui/hooks/use-click-outside";
import { cn } from "@shared/ui/lib/utils";

interface SmoothDialogContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  uniqueId: string;
  triggerRef: React.RefObject<HTMLDivElement>;
}

const SmoothDialogContext = createContext<SmoothDialogContextType | null>(null);

function useSmoothDialog() {
  const context = useContext(SmoothDialogContext);
  if (!context) {
    throw new Error(
      "useSmoothDialog must be used within a SmoothDialogProvider",
    );
  }
  return context;
}

interface SmoothDialogProviderProps {
  children: React.ReactNode;
  transition?: Transition;
}

function SmoothDialogProvider({
  children,
  transition,
}: SmoothDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const uniqueId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);

  const contextValue = useMemo(
    () => ({ isOpen, setIsOpen, uniqueId, triggerRef }),
    [isOpen, uniqueId],
  );

  return (
    // @ts-expect-error - libs error
    <SmoothDialogContext.Provider value={contextValue}>
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </SmoothDialogContext.Provider>
  );
}

interface SmoothDialogProps {
  children: React.ReactNode;
  transition?: Transition;
}

function SmoothDialog({ children, transition }: SmoothDialogProps) {
  return (
    <SmoothDialogProvider>
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </SmoothDialogProvider>
  );
}

interface SmoothDialogTriggerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  triggerRef?: React.RefObject<HTMLDivElement>;
}

function SmoothDialogTrigger({
  children,
  className,
  style,
  triggerRef,
}: SmoothDialogTriggerProps) {
  const { setIsOpen, isOpen, uniqueId } = useSmoothDialog();

  const handleClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
    },
    [isOpen, setIsOpen],
  );

  return (
    <motion.div
      aria-controls={`SmoothDialog-content-${uniqueId}`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      className={cn("relative cursor-pointer", className)}
      layoutId={`SmoothDialog-${uniqueId}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      ref={triggerRef}
      role="button"
      style={style}
    >
      {children}
    </motion.div>
  );
}

interface SmoothDialogContent {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function SmoothDialogContent({
  children,
  className,
  style,
}: SmoothDialogContent) {
  const { setIsOpen, isOpen, uniqueId, triggerRef } = useSmoothDialog();
  const containerRef = useRef<HTMLDivElement>(null);
  const [firstFocusableElement, setFirstFocusableElement] =
    useState<HTMLElement | null>(null);
  const [lastFocusableElement, setLastFocusableElement] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      if (event.key === "Tab") {
        if (!firstFocusableElement || !lastFocusableElement) return;

        if (event.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            event.preventDefault();
            lastFocusableElement.focus();
          }
        } else if (document.activeElement === lastFocusableElement) {
          event.preventDefault();
          firstFocusableElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsOpen, firstFocusableElement, lastFocusableElement]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusableElements && focusableElements.length > 0) {
        setFirstFocusableElement(focusableElements[0] as HTMLElement);
        setLastFocusableElement(
          focusableElements[focusableElements.length - 1] as HTMLElement,
        );
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      document.body.classList.remove("overflow-hidden");
      triggerRef.current.focus();
    }
  }, [isOpen, triggerRef]);

  // @ts-expect-error - libs error
  useClickOutside(containerRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  return (
    <motion.div
      aria-describedby={`SmoothDialog-description-${uniqueId}`}
      aria-labelledby={`SmoothDialog-title-${uniqueId}`}
      aria-modal="true"
      className={cn("overflow-hidden", className)}
      layoutId={`SmoothDialog-${uniqueId}`}
      ref={containerRef}
      role="dialog"
      style={style}
    >
      {children}
    </motion.div>
  );
}

interface SmoothDialogContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function SmoothDialogContainer({ children }: SmoothDialogContainerProps) {
  const { isOpen, uniqueId } = useSmoothDialog();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence initial={false} mode="sync">
      {isOpen ? (
        <>
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 h-full w-full bg-white/40 backdrop-blur-sm dark:bg-black/40"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key={`backdrop-${uniqueId}`}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {children}
          </div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

interface SmoothDialogTitleProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function SmoothDialogTitle({
  children,
  className,
  style,
}: SmoothDialogTitleProps) {
  const { uniqueId } = useSmoothDialog();

  return (
    <motion.div
      className={className}
      layout
      layoutId={`SmoothDialog-title-container-${uniqueId}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}

interface SmoothDialogSubtitleProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function SmoothDialogSubtitle({
  children,
  className,
  style,
}: SmoothDialogSubtitleProps) {
  const { uniqueId } = useSmoothDialog();

  return (
    <motion.div
      className={className}
      layoutId={`SmoothDialog-subtitle-container-${uniqueId}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}

interface SmoothDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
  disableLayoutAnimation?: boolean;
  variants?: {
    initial: Variant;
    animate: Variant;
    exit: Variant;
  };
}

function SmoothDialogDescription({
  children,
  className,
  variants,
  disableLayoutAnimation,
}: SmoothDialogDescriptionProps) {
  const { uniqueId } = useSmoothDialog();

  return (
    <motion.div
      animate="animate"
      className={className}
      exit="exit"
      id={`SmoothDialog-description-${uniqueId}`}
      initial="initial"
      key={`SmoothDialog-description-${uniqueId}`}
      layoutId={
        disableLayoutAnimation
          ? undefined
          : `SmoothDialog-description-content-${uniqueId}`
      }
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

interface SmoothDialogImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

function SmoothDialogImage({
  src,
  alt,
  className,
  style,
}: SmoothDialogImageProps) {
  const { uniqueId } = useSmoothDialog();

  return (
    <motion.img
      alt={alt}
      className={cn(className)}
      layoutId={`SmoothDialog-img-${uniqueId}`}
      src={src}
      style={style}
    />
  );
}

interface SmoothDialogCloseProps {
  children?: React.ReactNode;
  className?: string;
  variants?: {
    initial: Variant;
    animate: Variant;
    exit: Variant;
  };
}

function SmoothDialogClose({
  children,
  className,
  variants,
}: SmoothDialogCloseProps) {
  const { setIsOpen, uniqueId } = useSmoothDialog();

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <motion.button
      animate="animate"
      aria-label="Close SmoothDialog"
      className={cn("absolute right-6 top-6", className)}
      exit="exit"
      initial="initial"
      key={`SmoothDialog-close-${uniqueId}`}
      onClick={handleClose}
      type="button"
      variants={variants}
    >
      {children ?? <XIcon size={24} />}
    </motion.button>
  );
}

export {
  SmoothDialog,
  SmoothDialogTrigger,
  SmoothDialogContainer,
  SmoothDialogContent,
  SmoothDialogClose,
  SmoothDialogTitle,
  SmoothDialogSubtitle,
  SmoothDialogDescription,
  SmoothDialogImage,
};

// USAGE :
// <SmoothDialog
//     key={index}
//     transition={{
//         type: "spring",
//         stiffness: 200,
//         damping: 24,
//     }}
// >
//     <SmoothDialogTrigger
//         className="border border-gray-200/60 bg-white"
//         style={{
//             borderRadius: "4px",
//         }}
//     >
//         <DropdownMenuItem key={index} onClick={action.function}>
//             {action.title}
//             <DropdownMenuShortcut>
//                 <action.icon className="size-4" />
//             </DropdownMenuShortcut>
//         </DropdownMenuItem>
//     </SmoothDialogTrigger>
//     <SmoothDialogContainer>
//         <SmoothDialogContent
//             className="relative h-auto w-[500px] border border-gray-100 bg-white"
//             style={{
//                 borderRadius: "12px",
//             }}
//         >
//             <div className="relative p-6">
//                 <div className="flex justify-center py-10">
//                     <SmoothDialogImage
//                         alt="What I Talk About When I Talk About Running - book cover"
//                         className="h-auto w-[200px]"
//                         src="https://m.media-amazon.com/images/I/71skAxiMC2L._AC_UF1000,1000_QL80_.jpg"
//                     />
//                 </div>
//                 <div className="">
//                     <SmoothDialogTitle className="text-black">
//                         What I Talk About When I Talk About Running
//                     </SmoothDialogTitle>
//                     <SmoothDialogSubtitle className="font-light text-gray-400">
//                         Haruki Murakami
//                     </SmoothDialogSubtitle>
//                     <div className="mt-4 text-sm text-gray-700">
//                         <p>
//                             In 1982, having sold his jazz bar to devote himself to
//                             writing, Murakami began running to keep fit. A year
//                             later, he’d completed a solo course from Athens to
//                             Marathon, and now, after dozens of such races, not to
//                             mention triathlons and a dozen critically acclaimed
//                             books, he reflects upon the influence the sport has
//                             had on his life and—even more important—on his
//                             writing.
//                         </p>
//                         <p>
//                             Equal parts training log, travelogue, and
//                             reminiscence, this revealing memoir covers his
//                             four-month preparation for the 2005 New York City
//                             Marathon and takes us to places ranging from Tokyo’s
//                             Jingu Gaien gardens, where he once shared the course
//                             with an Olympian, to the Charles River in Boston among
//                             young women who outpace him. Through this marvelous
//                             lens of sport emerges a panorama of memories and
//                             insights: the eureka moment when he decided to become
//                             a writer, his greatest triumphs and disappointments,
//                             his passion for vintage LPs, and the experience, after
//                             fifty, of seeing his race times improve and then fall
//                             back.
//                         </p>
//                         <p>
//                             By turns funny and sobering, playful and
//                             philosophical, What I Talk About When I Talk About
//                             Running is rich and revelatory, both for fans of this
//                             masterful yet guardedly private writer and for the
//                             exploding population of athletes who find similar
//                             satisfaction in running.
//                         </p>
//                     </div>
//                 </div>
//             </div>
//             <SmoothDialogClose className="text-zinc-500" />
//         </SmoothDialogContent>
//     </SmoothDialogContainer>
// </SmoothDialog>
