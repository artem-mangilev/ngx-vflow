import { AnyComponentEdgeEvent, isComponentEdgeEvent } from './component-edge-event.interface';

class LabelledEdgeComponent {}
class PlainEdgeComponent {}

describe('isComponentEdgeEvent', () => {
  const event: AnyComponentEdgeEvent = {
    edgeId: 'a-b',
    component: LabelledEdgeComponent,
    eventName: 'picked',
    eventPayload: 'a',
  };

  it.each([
    ['the class that emitted it', LabelledEdgeComponent, true],
    ['another class', PlainEdgeComponent, false],
  ])('tells whether an event comes from %s', (_, component, expected) => {
    expect(isComponentEdgeEvent(event, component)).toBe(expected);
  });
});
