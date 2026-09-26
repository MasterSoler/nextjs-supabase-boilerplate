'use client';

import { owebLoginUrl } from '@/lib/oweb/config';
import { Button } from '@/components/ui/button';

type ContinueWithOwebProps = {
  label?: string;
  className?: string;
};

/** Path B auth return — OWeb login with `launch=paystub`, then SSO back to `/sso`. */
export function ContinueWithOweb({
  label = 'Continue with OWeb',
  className
}: ContinueWithOwebProps) {
  return (
    <Button variant="outline" className={className ?? 'w-full'} asChild>
      <a href={owebLoginUrl()}>{label}</a>
    </Button>
  );
}
