interface PipelineStep<T, TResult> {
    execute(input: T, previousResult?: TResult): Promise<TResult>;
    setNext(next: PipelineStep<T, TResult> | null): void;
    getNext(): PipelineStep<T, TResult> | null;
}

export class PipelineStepImpl<T, TResult> implements PipelineStep<T, TResult> {
    private next: PipelineStep<T, TResult> | null = null;
    private state: string = 'ready';
    private startTime: number = 0;
    private executeFn: (input: T, previousResult?: TResult) => Promise<TResult>;
    constructor(executeFn: (input: T) => Promise<TResult>) {
        this.executeFn = executeFn;
    }
    async execute(input: T, previousResult?: TResult): Promise<TResult> {
        this.state = 'running';
        this.startTime = Date.now();
        try {
            const result = await this.executeFn(input, previousResult);
            console.log(`Step completed: ${this.state}`);
            return result;
        } catch (error) {
            console.error(`An error occurred in step: ${error}`);
            throw error;
        } finally {
            this.state = 'completed';
            console.log(`Step took ${Date.now() - this.startTime}ms`);
        }
    }

    setNext(next: PipelineStep<T, TResult> | null): void {
        this.next = next;
    }

    getNext(): PipelineStep<T, TResult> | null {
        return this.next;
    }
}

export class PipelineExecutor<T, TResult> {
    private head: PipelineStep<T, TResult> | null = null;
    private tail: PipelineStep<T, TResult> | null = null;
    private pipelineState: { [index: string]: string } = {};
    private startTime: number = 0;
    private abortSignal: AbortSignal;

    constructor(abortSignal: AbortSignal) {
        this.abortSignal = abortSignal;
        this.abortSignal.addEventListener('abort', this.handleAbort);
    }

    addStep(step: PipelineStep<T, TResult>): void {
        if (this.head === null) {
            this.head = step;
            this.tail = step;
        } else {
            this.tail.setNext(step);
            this.tail = step;
        }
        this.pipelineState[step.constructor.name] = 'ready';
    }

    async execute(input: T, previousResult?: TResult): Promise<T> {
        this.startTime = Date.now();
        let currentStep = this.head;
        while (currentStep !== null && !this.abortSignal.aborted) {
            this.pipelineState[currentStep.constructor.name] = 'running';
            try {
                previousResult = await currentStep.execute(input, previousResult);
                this.pipelineState[currentStep.constructor.name] = 'completed';
                currentStep = currentStep.getNext();
            } catch (error) {
                this.pipelineState[currentStep.constructor.name] = 'failed';
                throw error;
            }
        }
        if (this.abortSignal.aborted) {
            throw new Error('Pipeline execution was aborted');
        }
        const totalTime = Date.now() - this.startTime;
        console.log(`Pipeline completed. Total time: ${totalTime}ms`);
        return input;
    }

    handleAbort = () => {
        console.log('Pipeline execution was aborted by the caller');
        // 在这里可以添加额外的清理或状态更新逻辑
    };

    getState(): { [index: string]: string } {
        return this.pipelineState;
    }
}

// 使用示例
// // 创建一个可以被取消的 AbortController
// const abortController = new AbortController();
// const signal = abortController.signal;

// // 创建几个步骤并添加到执行器
// const step1 = new PipelineStepImpl<number>();
// const step2 = new PipelineStepImpl<number>();
// const step3 = new PipelineStepImpl<number>();
// const executor = new PipelineExecutor<number>(signal);
// executor.addStep(step1);
// executor.addStep(step2);
// executor.addStep(step3);

// // 执行管道
// try {
//     const result = await executor.execute(1);
//     console.log('Pipeline result:', result);
// } catch (error) {
//     console.error('Pipeline failed or was aborted:', error);
// }

// // 在任意时刻取消 pipeline 的执行
// setTimeout(() => {
//     abortController.abort();
// }, 2000); // 例如，在 2 秒后取消 pipeline

export type PipelineFunction<T, TResult> = (
    input: T,
    prevResult?: TResult
) => Promise<TResult>;

export class Pipeline<T, TResult> {
    private functions: PipelineFunction<T, TResult>[] = [];

    constructor(...functions: PipelineFunction<T, TResult>[]) {
        this.functions = functions;
    }

    async execute(input: T): Promise<TResult> {
        let result: TResult = undefined;

        for (const func of this.functions) {
            result = await func(input, result);
        }

        return result;
    }

    next(...functions: PipelineFunction<T, TResult>[]): Pipeline<T, TResult> {
        return new Pipeline<T, TResult>(...this.functions, ...functions);
    }
}