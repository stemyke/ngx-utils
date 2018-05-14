import {ITimer} from "../common-types";

export class TimerUtils {

    static createTimeout(): ITimer {
        const timer: ITimer = {};
        timer.set = (func: Function, time: number) => {
            timer.clear();
            timer.id = setTimeout(() => {
                timer.id = null;
                func();
            }, time);
        };
        timer.clear = () => {
            if (!timer.id) return;
            clearTimeout(timer.id);
            timer.id = null;
        };
        return timer;
    }

    static createInterval(): ITimer {
        const timer: ITimer = {};
        timer.set = (func: Function, time: number) => {
            timer.clear();
            timer.id = setInterval(func, time);
        };
        timer.clear = () => {
            if (!timer.id) return;
            clearInterval(timer.id);
            timer.id = null;
        };
        return timer;
    }
}
