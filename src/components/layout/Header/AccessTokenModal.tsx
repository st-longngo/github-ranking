'use client';

import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useGitHubToken } from '@/hooks/useGitHubToken';

interface AccessTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AccessTokenModal({ open, onOpenChange }: AccessTokenModalProps) {
  const { token, hasToken, saveToken, clearToken } = useGitHubToken();

  const [inputValue, setInputValue] = useState(token);
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when the dialog opens
  useEffect(() => {
    if (open) {
      setInputValue(token);
      setShowToken(false);
      setSaved(false);
      setErrorMsg(null);
      // Focus the input after the dialog animation settles
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open, token]);

  function handleSave() {
    const err = saveToken(inputValue);
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg(null);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onOpenChange(false);
    }, 1200);
  }

  function handleClear() {
    const err = clearToken();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setInputValue('');
    setSaved(false);
    setErrorMsg(null);
  }

  const canSave = inputValue.trim().length > 0 && !saved;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-lg font-semibold">
            Add GitHub Access Token
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <p className="text-sm leading-relaxed text-foreground">
            This site uses the GitHub API to retrieve repository metadata. You may see cached or
            fallback data because the{' '}
            <a
              href="https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              GitHub API rate limit
            </a>{' '}
            has been reached.
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            Add your{' '}
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              personal access token
            </a>{' '}
            to unlock live data. No personal data scopes are needed — public repository read access
            is sufficient.
          </p>

          {/* Token input */}
          <div className="space-y-1.5">
            <label htmlFor="gh-token-input" className="text-sm font-semibold">
              Access Token{' '}
              <span className="font-normal text-muted">(stored in your browser only)</span>
            </label>
            <div className="relative">
              <Input
                ref={inputRef}
                id="gh-token-input"
                type={showToken ? 'text' : 'password'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canSave && handleSave()}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                autoComplete="off"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken((p) => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
                aria-label={showToken ? 'Hide token' : 'Show token'}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-sm text-critical">{errorMsg}</p>
          )}
          {saved && (
            <p className="text-sm font-medium text-live">✓ Token saved successfully</p>
          )}
        </div>

        <DialogFooter className="flex-row items-center justify-between border-t border-border px-6 py-4">
          <div>
            {hasToken && (
              <button
                type="button"
                onClick={handleClear}
                className="text-sm text-muted transition-colors hover:text-critical"
              >
                Remove token
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!canSave}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
