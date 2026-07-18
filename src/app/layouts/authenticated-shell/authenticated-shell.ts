import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-authenticated-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './authenticated-shell.html',
  styleUrl: './authenticated-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticatedShell {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly desktopMediaQuery =
    this.document.defaultView?.matchMedia?.('(min-width: 1024px)');

  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly closeMenuButton = viewChild<ElementRef<HTMLButtonElement>>('closeMenuButton');

  readonly menuOpen = signal(false);
  readonly isDesktop = signal(this.desktopMediaQuery?.matches ?? false);
  readonly formattedDate = this.formatCurrentDate();
  readonly todayIso = this.formatIsoDate(new Date());

  constructor() {
    const handleBreakpointChange = (event: MediaQueryListEvent): void => {
      this.isDesktop.set(event.matches);
      if (event.matches) {
        this.closeMenu(false);
      }
    };

    this.desktopMediaQuery?.addEventListener('change', handleBreakpointChange);
    this.destroyRef.onDestroy(() => {
      this.desktopMediaQuery?.removeEventListener('change', handleBreakpointChange);
    });

    effect((onCleanup) => {
      if (!this.menuOpen() || this.isDesktop()) {
        return;
      }

      const previousOverflow = this.document.body.style.overflow;
      this.document.body.style.overflow = 'hidden';
      onCleanup(() => {
        this.document.body.style.overflow = previousOverflow;
      });
    });
  }

  protected openMenu(): void {
    if (this.isDesktop()) {
      return;
    }

    this.menuOpen.set(true);
    queueMicrotask(() => this.closeMenuButton()?.nativeElement.focus());
  }

  protected closeMenu(returnFocus = true): void {
    if (!this.menuOpen()) {
      return;
    }

    this.menuOpen.set(false);
    if (returnFocus && !this.isDesktop()) {
      queueMicrotask(() => this.menuButton()?.nativeElement.focus());
    }
  }

  protected logout(): void {
    this.closeMenu(false);
    void this.router.navigateByUrl('/login');
  }

  @HostListener('document:keydown.escape')
  protected handleEscape(): void {
    this.closeMenu();
  }

  private formatCurrentDate(): string {
    const formatted = new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
  }

  private formatIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
