// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;

export abstract class AbstractBaseEvent {
  public eventName = this.constructor.name;
}

export type EventHandler<EventType extends AbstractBaseEvent> = (
  event: EventType
) => Promise<void> | void;

type AnyEventHandler = EventHandler<AbstractBaseEvent>;

class Subscription {
  public constructor(
    public readonly id: number,
    public readonly eventName: string,
    public readonly handler: AnyEventHandler
  ) {}
}

export class EventBus {
  private subscriptions: Subscription[] = [];
  private lastId = 1;

  public subscribe<T extends AbstractBaseEvent>(
    eventClass: Constructor<T>,
    handler: EventHandler<T>
  ): number {
    const eventName = eventClass.name;
    const id = this.lastId++;
    this.subscriptions.push(
      new Subscription(id, eventName, handler as AnyEventHandler)
    );
    return id;
  }

  public unsubscribeBySubscriptionId(id: number): void {
    this.subscriptions = this.subscriptions.filter((s) => s.id !== id);
  }

  public unsubscribeByEventClass<T extends AbstractBaseEvent>(
    eventClass: Constructor<T>
  ): void {
    const eventName = eventClass.name;
    this.subscriptions = this.subscriptions.filter(
      (s) => s.eventName !== eventName
    );
  }

  public async publish<T extends AbstractBaseEvent>(event: T): Promise<void> {
    await Promise.all(
      this.subscriptions
        .filter((s) => s.eventName === event.constructor.name)
        .map(async (s) => {
          await s.handler(event);
        })
    );
  }
}
