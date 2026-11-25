import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';
import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

// An application with zone.js: its patches of listeners and observers reach the library in a test.
@NgModule({ providers: [provideZoneChangeDetection()] })
class ZoneTestingModule {}

getTestBed().initTestEnvironment([BrowserTestingModule, ZoneTestingModule], platformBrowserTesting());
