import { enhance } from '$app/forms';
import type { SubmitFunction } from '@sveltejs/kit';

/**
 * Enhanced version of SvelteKit's use:enhance.
 * Automatically finds the submit button, disables it, and replaces its content with a spinner.
 */
export function loadingEnhance(node: HTMLFormElement, submitFunction?: SubmitFunction<any, any>) {
    let submitBtn: HTMLButtonElement | null = null;
    let originalHtml = '';

    const { destroy } = enhance(node, (submitData) => {
        submitBtn = (submitData.submitter as HTMLButtonElement) || node.querySelector('button[type="submit"]');
        
        if (submitBtn && !submitBtn.dataset.loading) {
            submitBtn.dataset.loading = "true";
            originalHtml = submitBtn.innerHTML;
            
            // Fix dimensions to prevent layout shift during spinner injection
            const w = submitBtn.offsetWidth;
            const h = submitBtn.offsetHeight;
            if (w > 0 && h > 0) {
                submitBtn.style.width = w + 'px';
                submitBtn.style.height = h + 'px';
            }
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<svg class="animate-spin h-5 w-5 mx-auto text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
        }
        
        let customReturn: ReturnType<SubmitFunction> | undefined;
        if (typeof submitFunction === 'function') {
            customReturn = submitFunction(submitData);
        }

        return async (resultData) => {
            if (customReturn instanceof Promise) {
                const resolved = await customReturn;
                if (typeof resolved === 'function') {
                    await resolved(resultData);
                } else {
                    await resultData.update();
                }
            } else if (typeof customReturn === 'function') {
                await customReturn(resultData);
            } else {
                await resultData.update();
            }
            
            if (submitBtn) {
                submitBtn.innerHTML = originalHtml;
                submitBtn.disabled = false;
                submitBtn.style.width = '';
                submitBtn.style.height = '';
                delete submitBtn.dataset.loading;
            }
        };
    });

    return { destroy };
}

/**
 * Action to handle async click events on buttons, showing a spinner while resolving.
 */
export function loadingClick(node: HTMLButtonElement, clickHandler: (e: MouseEvent) => Promise<any> | void) {
    let originalHtml = '';
    
    async function onClick(e: MouseEvent) {
        if (node.disabled || node.dataset.loading) return;
        
        const result = clickHandler(e);
        if (result instanceof Promise) {
            node.dataset.loading = "true";
            originalHtml = node.innerHTML;
            
            const w = node.offsetWidth;
            const h = node.offsetHeight;
            if (w > 0 && h > 0) {
                node.style.width = w + 'px';
                node.style.height = h + 'px';
            }
            
            node.disabled = true;
            node.innerHTML = `<svg class="animate-spin h-5 w-5 mx-auto text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
            
            try {
                await result;
            } finally {
                node.innerHTML = originalHtml;
                node.disabled = false;
                node.style.width = '';
                node.style.height = '';
                delete node.dataset.loading;
            }
        }
    }
    
    node.addEventListener('click', onClick);
    return {
        update(newHandler: (e: MouseEvent) => Promise<any> | void) {
            node.removeEventListener('click', onClick);
            clickHandler = newHandler;
            node.addEventListener('click', onClick);
        },
        destroy() {
            node.removeEventListener('click', onClick);
        }
    };
}
