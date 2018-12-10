import {ITimer} from "../common-types";
import {ObjectUtils} from "./object.utils";

type TimerFunc = (timer: ITimer) => void;

export class TimerUtils {

    static createTimeout(func?: Function, time?: number): ITimer {
        return TimerUtils.createTimer(timer => {
            timer.clear();
            timer.id = setTimeout(() => {
                timer.id = null;
                timer.func();
            }, timer.time);
        }, timer => {
            if (!timer.id) return;
            clearTimeout(timer.id);
            timer.id = null;
        }, func, time);
    }

    static createInterval(func?: Function, time?: number): ITimer {
        return TimerUtils.createTimer(timer => {
            timer.clear();
            timer.id = setInterval(timer.func, timer.time);
        }, timer => {
            if (!timer.id) return;
            clearInterval(timer.id);
            timer.id = null;
        }, func, time);
    }

    private static createTimer(run: TimerFunc, clear: TimerFunc, func: Function, time: number): ITimer {
        const timer: ITimer = {};
        timer.set = (func: Function, time: number) => {
            if (!ObjectUtils.isFunction(timer.func) || !ObjectUtils.isNumber(timer.time)) return;
            timer.func = func;
            timer.time = time;
            timer.run();
        };
        timer.run = () => run(timer);
        timer.clear = () => clear(timer);
        timer.set(func, time);
        return timer;
    }
}
