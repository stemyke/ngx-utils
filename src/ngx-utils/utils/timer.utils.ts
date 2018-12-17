import {ITimer} from "../common-types";
import {ObjectUtils} from "./object.utils";

type TimerFunc = (timer: ITimer) => void;

export class TimerUtils {

    static createTimeout(func?: Function, time?: number): ITimer {
        // @dynamic
        const run = (timer: ITimer) => {
            timer.clear();
            timer.id = setTimeout(() => {
                timer.id = null;
                timer.func();
            }, timer.time);
        };
        // @dynamic
        const clear = (timer: ITimer) => {
            if (!timer.id) return;
            clearTimeout(timer.id);
            timer.id = null;
        };
        return TimerUtils.createTimer(run, clear, func, time);
    }

    static createInterval(func?: Function, time?: number): ITimer {
        // @dynamic
        const run = (timer: ITimer) => {
            timer.clear();
            timer.id = setInterval(timer.func, timer.time);
        };
        // @dynamic
        const clear = (timer: ITimer) => {
            if (!timer.id) return;
            clearInterval(timer.id);
            timer.id = null;
        };
        return TimerUtils.createTimer(run, clear, func, time);
    }

    private static createTimer(run: TimerFunc, clear: TimerFunc, func: Function, time: number): ITimer {
        const timer: ITimer = {};
        const setParams = (func: Function, time: number) => {
            timer.func = !ObjectUtils.isFunction(func) ? (() => {}) : func;
            timer.time = !ObjectUtils.isNumber(time) ? 100 : time;
        };
        timer.run = () => run(timer);
        timer.clear = () => clear(timer);
        timer.set = (func: Function, time: number) => {
            setParams(func, time);
            timer.run();
        };
        setParams(func, time);
        return timer;
    }
}
