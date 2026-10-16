import type * as React from 'react';

/** Value props shared by every control: controlled with `value` + `onChange`, or uncontrolled with `defaultValue`. */
interface ValueProps<T> { value?: T; defaultValue?: T; onChange?: (value: T) => void }
interface RangeProps { min?: number; max?: number; step?: number }
interface Labelled { label?: React.ReactNode; tooltip?: string }

export interface PanelProps { label?: string; vertical?: boolean; wrap?: boolean; switchable?: boolean; on?: boolean; defaultOn?: boolean; onSwitch?: (on: boolean) => void; className?: string; style?: React.CSSProperties; children?: React.ReactNode }
/** Titled container (`patcol`); `switchable` puts a PanelSwitch in the title. */
export declare function Panel(props: PanelProps): React.ReactElement;
/** A Panel inside another Panel's body; vertical by default. */
export declare function SubPanel(props: PanelProps): React.ReactElement;

export interface PanelSwitchProps { label?: React.ReactNode; on?: boolean; defaultOn?: boolean; onChange?: (on: boolean) => void }
export declare function PanelSwitch(props: PanelSwitchProps): React.ReactElement;

export interface TabPanelProps { tabs: { label: React.ReactNode; content: React.ReactNode }[]; defaultIndex?: number }
export declare function TabPanel(props: TabPanelProps): React.ReactElement;

export interface LabelProps { tooltip?: string; children?: React.ReactNode }
export declare function Label(props: LabelProps): React.ReactElement;

export interface ValueBoxProps { value: number; step?: number; unit?: string; size?: number; onChange?: (value: number) => void; ariaLabel?: string }
/** Editable read-out; commits on Enter or blur. */
export declare function ValueBox(props: ValueBoxProps): React.ReactElement;

export interface StatusBadgeProps { level?: 'ok' | 'warn' | 'err' | 'muted'; title?: string; children?: React.ReactNode }
export declare function StatusBadge(props: StatusBadgeProps): React.ReactElement;

export interface FaderProps extends ValueProps<number>, RangeProps, Labelled { height?: number; log?: boolean; unit?: string; size?: number }
/** Vertical slider (default 200px) with a ValueBox; drag, arrow keys, Page Up/Down, Home/End. */
export declare function Fader(props: FaderProps): React.ReactElement;

export interface HFaderProps extends ValueProps<number>, RangeProps { label?: string; vals?: number[] }
/** 120px horizontal slider with ticks and labels at `vals`. */
export declare function HFader(props: HFaderProps): React.ReactElement;

export interface KnobProps extends ValueProps<number>, RangeProps, Labelled { size?: number; digits?: number; unit?: string }
/** 300° knob (default 50px); drag up or right to increase. */
export declare function Knob(props: KnobProps): React.ReactElement;

export interface SpinnerProps extends ValueProps<number>, RangeProps { size?: number; unit?: string; ariaLabel?: string }
/** Number field with ▲▼ buttons (press and hold repeats); typed text commits on Enter or blur. */
export declare function Spinner(props: SpinnerProps): React.ReactElement;

export interface NumberInputProps extends SpinnerProps, Labelled {}
export declare function NumberInput(props: NumberInputProps): React.ReactElement;

export interface SelectItem<T = number> { name: string; value: T }
export interface SelectProps<T = number> extends ValueProps<T>, Labelled { items: SelectItem<T>[]; vertical?: boolean }
/** Radio group of small buttons. */
export declare function Select<T = number>(props: SelectProps<T>): React.ReactElement;

export interface XY { x: number; y: number }
export interface XYPadProps extends ValueProps<XY> { minX?: number; maxX?: number; minY?: number; maxY?: number; step?: number; size?: number; sum?: boolean; label?: string }
/** Square pad sending two values; `sum` keeps the dot in the top-left half (x + y within the range). */
export declare function XYPad(props: XYPadProps): React.ReactElement;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'secondary' | 'primary' | 'warning'; icon?: 'save' | 'load' | 'keyboard' }
export declare function Button(props: ButtonProps): React.ReactElement;

export interface DropdownOption<T = string> { value: T; label: string }
export interface DropdownProps<T = string> extends ValueProps<T> { options: DropdownOption<T>[]; minWidth?: string }
/** react-select look-alike for tuning and MIDI menus; keyboard: ↓ ↑ Enter Esc. */
export declare function Dropdown<T = string>(props: DropdownProps<T>): React.ReactElement;

export interface IconProps { name: 'save' | 'load' | 'keyboard'; className?: string }
export declare function Icon(props: IconProps): React.ReactElement;

declare global { interface Window { CsoundWebUI: { Panel: typeof Panel; SubPanel: typeof SubPanel; PanelSwitch: typeof PanelSwitch; TabPanel: typeof TabPanel; Label: typeof Label; ValueBox: typeof ValueBox; StatusBadge: typeof StatusBadge; Fader: typeof Fader; HFader: typeof HFader; Knob: typeof Knob; Spinner: typeof Spinner; NumberInput: typeof NumberInput; Select: typeof Select; XYPad: typeof XYPad; Button: typeof Button; Dropdown: typeof Dropdown; Icon: typeof Icon } } }
