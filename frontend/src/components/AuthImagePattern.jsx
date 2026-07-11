import { Image, MessageSquare, Users, Zap } from "lucide-react";

const FEATURES = [
  { icon: Zap, text: "Real-time messaging with typing indicators" },
  { icon: Image, text: "Share photos and moments instantly" },
  { icon: Users, text: "See who's online and stay connected" },
];

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-primary/15 via-base-200 to-primary/5 p-12 lg:flex">
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative max-w-md space-y-8">
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
            <MessageSquare className="size-8 text-primary" />
          </div>
        </div>

        <div className="animate-ease-out-float">
          <img
            src="/preview.png"
            alt=""
            className="mx-auto max-w-[260px] rounded-2xl border border-base-300/50 shadow-lg"
          />
        </div>

        <div className="text-center">
          <h2 className="mb-3 text-2xl font-bold">{title}</h2>
          <p className="mb-6 text-base-content/60">{subtitle}</p>

          <ul className="space-y-3 text-left">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-3 text-sm text-base-content/80"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </div>
                <span className="pt-1">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;
