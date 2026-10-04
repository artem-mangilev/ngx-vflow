import '@angular/compiler';
import { NgModule, provideZonelessChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

// The library runs without zone.js, so every TestBed is zoneless.
@NgModule({ providers: [provideZonelessChangeDetection()] })
class ZonelessTestingModule {}

getTestBed().initTestEnvironment([BrowserTestingModule, ZonelessTestingModule], platformBrowserTesting());
