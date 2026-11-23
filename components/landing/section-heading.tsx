import { monoLabelClass } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
  titleClassName,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
  titleClassName?: string;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? (
        <span className="mb-2 inline-block w-fit rounded-md bg-black px-2 py-1 font-mono text-[16px] text-white">{eyebrow}</span>
      ) : null}
      <h2 className={`${eyebrow ? "mt-4" : ""} text-balance font-semibold tracking-tight text-black ${titleClassName ?? "text-3xl sm:text-4xl"}`}>
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-base leading-7 text-zinc-600">
          {description}
        </p>
      ) : null}
    </div>
  );
}
