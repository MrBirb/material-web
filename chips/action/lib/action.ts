/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '@material/web/focus/focus-ring';
import '@material/web/ripple/ripple';

import {ActionElement, BeginPressConfig, EndPressConfig} from '@material/web/actionelement/action-element';
import {KEY} from '@material/web/compat/dom/keyboard';
import {ariaProperty} from '@material/web/decorators/aria-property';
import {pointerPress, shouldShowStrongFocus} from '@material/web/focus/strong-focus';
import {MdRipple} from '@material/web/ripple/ripple';
import {html, TemplateResult} from 'lit';
import {property, query, state} from 'lit/decorators';
import {ClassInfo, classMap} from 'lit/directives/class-map';
import {Md3ChipActionEventType} from './events';

/**
 * Base class for all actions.
 * @soyCompatible
 */
export abstract class Action extends ActionElement {
  @property({type: Boolean, reflect: true}) isDeletable = false;

  @property({type: Boolean, reflect: true}) isFocusable = false;

  @property({type: Boolean, reflect: true}) isTouchable = false;

  @property({type: Boolean, reflect: true}) disabled = false;

  @state() showFocusRing = false;

  @query('md-ripple') ripple!: MdRipple|null;

  /** @soyPrefixAttribute */
  @ariaProperty  // tslint:disable-line:no-new-decorators
  @property({type: String, attribute: 'aria-label'})
  override ariaLabel!: string;

  /** @soyTemplate */
  protected getRootClasses(): ClassInfo {
    return {
      'md3-chip__action': true,
    };
  }

  /** @soyTemplate */
  protected getRippleClasses(): ClassInfo {
    return {
      'md3-chip__ripple': true,
    };
  }

  /** @soyTemplate */
  protected renderTouchTarget(): TemplateResult {
    return  this.isTouchable ?
        html`<span class="md3-chip__action-touch"></span>` : html`` ;
  }

  /** @soyTemplate */
  protected renderRipple(): TemplateResult {
    return html`
      <md-ripple class="${classMap(this.getRippleClasses())}"
          ?disabled="${this.disabled}">
      </md-ripple>`;
  }

  /** @soyTemplate */
  protected renderFocusRing(): TemplateResult {
    return html`
      <md-focus-ring .visible="${this.showFocusRing}"></md-focus-ring>`;
  }

  protected handleFocus() {
    this.showFocusRing = shouldShowStrongFocus();
  }

  protected handleBlur() {
    this.showFocusRing = false;
  }

  override beginPress({positionEvent}: BeginPressConfig) {
    this.ripple?.beginPress(positionEvent);
  }

  override endPress(options: EndPressConfig) {
    super.endPress(options);
    this.ripple?.endPress();
    if (!options.cancelled) {
      this.dispatchCustomEvent(this.getInteractionEvent());
    }
  }

  protected handlePointerEnter(e: PointerEvent) {
    this.ripple?.beginHover(e);
  }

  override handlePointerLeave(e: PointerEvent) {
    super.handlePointerLeave(e);
    this.ripple?.endHover();
  }

  override handlePointerDown(e: PointerEvent) {
    super.handlePointerDown(e);
    pointerPress();
    this.showFocusRing = shouldShowStrongFocus();
  }

  override handleClick(e: MouseEvent) {
    super.handleClick(e);
    this.dispatchCustomEvent(this.getInteractionEvent());
  }

  protected handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case KEY.ENTER:
      case KEY.SPACEBAR:
        this.dispatchCustomEvent(this.getInteractionEvent());
        break;
      case KEY.DELETE:
      case KEY.BACKSPACE:
        if (this.isDeletable) {
          this.dispatchCustomEvent(Md3ChipActionEventType.DELETE);
        }
        break;
      case KEY.ARROW_LEFT:
        this.dispatchCustomEvent(this.isRTL() ?
            Md3ChipActionEventType.NAVIGATE_TO_NEXT :
            Md3ChipActionEventType.NAVIGATE_TO_PREV);
        break;
      case KEY.ARROW_RIGHT:
        this.dispatchCustomEvent(this.isRTL() ?
            Md3ChipActionEventType.NAVIGATE_TO_PREV :
            Md3ChipActionEventType.NAVIGATE_TO_NEXT);
        break;
      case KEY.HOME:
        this.dispatchCustomEvent(Md3ChipActionEventType.NAVIGATE_TO_FIRST);
        break;
      case KEY.END:
        this.dispatchCustomEvent(Md3ChipActionEventType.NAVIGATE_TO_LAST);
        break;
      default:
        // Unhandled key, do nothing.
    }
  }

  protected getInteractionEvent(): string {
    return Md3ChipActionEventType.SELECT;
  }

  private dispatchCustomEvent(eventType: string) {
    this.dispatchEvent(
        new CustomEvent(eventType, {bubbles: true, composed: true}));
  }

  private isRTL(): boolean {
    return getComputedStyle(this).getPropertyValue('direction') === 'rtl';
  }
}
