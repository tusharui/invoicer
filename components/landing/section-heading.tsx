import { monoLabelClass } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="mb-2 inline-block w-fit rounded-md bg-white px-2 py-1 font-mono text-[16px] text-black">{eyebrow}</span>
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-base leading-7 text-zinc-300">
          {description}
        </p>
      ) : null}
    </div>
  );
}
