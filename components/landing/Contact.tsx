'use client';

export default function Contact() {
  return (
    <div className="lg:col-span-7 flex flex-col px-6 justify-end items-start lg:items-end order-2 lg:order-1">
      <p className="text-[10px] md:text-xs font-light uppercase tracking-[0.2rem] mb-4 md:mb-6 text-muted-foreground">
        Inquiries
      </p>

      <a
        href="mailto:jayson@example.dev"
        className="
          text-xl sm:text-2xl md:text-4xl lg:text-5xl
          font-light tracking-tight

          text-foreground
          underline underline-offset-[8px] md:underline-offset-[10px]
          decoration-border hover:decoration-foreground

          transition-colors duration-300

          break-all sm:break-normal
          leading-tight
        "
      >
        jayson@example.dev
      </a>
    </div>
  );
}