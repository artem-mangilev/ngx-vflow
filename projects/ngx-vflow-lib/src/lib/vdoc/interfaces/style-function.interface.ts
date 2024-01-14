import { Signal } from "@angular/core";
import { UISnapshot } from "./ui-snapshot.interface";
import { ContainerStyleSheet, HtmlStyleSheet, RootStyleSheet } from "./stylesheet.interface";

export type ContainerStyleSheetFn = (snapshot: Signal<UISnapshot>) => ContainerStyleSheet
export type RootStyleSheetFn = (snapshot: Signal<UISnapshot>) => RootStyleSheet
export type HtmlStyleSheetFn = (snapshot: Signal<UISnapshot>) => HtmlStyleSheet
