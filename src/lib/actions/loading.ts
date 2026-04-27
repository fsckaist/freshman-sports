import { enhance } from '$app/forms';
import type { SubmitFunction } from '@sveltejs/kit';

/**
 * Enhanced version of SvelteKit's use:enhance.
 * Automatically finds the submit button, disables it, and replaces its content with a spinner.
 */
export function loadingEnhance(node: HTMLFormElement, submitFunction?: SubmitFunction<any, any>) {
    let submitBtn: HTMLButtonElement | null = null;

    const { destroy } = enhance(node, (submitData) => {
        submitBtn = (submitData.submitter as HTMLButtonElement) || node.querySelector('button[type="submit"]');
        
        if (submitBtn && !submitBtn.dataset.loading) {
            submitBtn.dataset.loading = "true";
            
            // Fix dimensions to prevent layout shift during spinner injection
            const w = submitBtn.offsetWidth;
            const h = submitBtn.offsetHeight;
            if (w > 0 && h > 0) {
                submitBtn.style.width = w + 'px';
                submitBtn.style.height = h + 'px';
            }
            
            // Make button relative to contain absolute spinner
            const computedStyle = getComputedStyle(submitBtn);
            if (computedStyle.position === 'static') {
                submitBtn.dataset.originalPosition = 'static';
                submitBtn.style.position = 'relative';
            }
            
            // Hide text with transparent color
            submitBtn.dataset.originalColor = submitBtn.style.color;
            submitBtn.style.color = 'transparent';
            
            // Hide element children with visibility
            for (let i = 0; i < submitBtn.children.length; i++) {
                const child = submitBtn.children[i] as HTMLElement;
                child.dataset.originalVisibility = child.style.visibility;
                child.style.visibility = 'hidden';
            }
            
            submitBtn.disabled = true;
            
            // Append absolute spinner
            const spinner = document.createElement('div');
            spinner.className = 'absolute inset-0 flex items-center justify-center text-zinc-500 dark:text-zinc-400';
            spinner.id = 'loading-enhance-spinner';
            spinner.innerHTML = `<svg class="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
            submitBtn.appendChild(spinner);
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
                const spinner = submitBtn.querySelector('#loading-enhance-spinner');
                if (spinner) spinner.remove();

                submitBtn.disabled = false;
                submitBtn.style.width = '';
                submitBtn.style.height = '';
                
                if (submitBtn.dataset.originalColor !== undefined) {
                    submitBtn.style.color = submitBtn.dataset.originalColor;
                    delete submitBtn.dataset.originalColor;
                }
                
                if (submitBtn.dataset.originalPosition === 'static') {
                    submitBtn.style.position = '';
                    delete submitBtn.dataset.originalPosition;
                }
                
                for (let i = 0; i < submitBtn.children.length; i++) {
                    const child = submitBtn.children[i] as HTMLElement;
                    if (child.dataset.originalVisibility !== undefined) {
                        child.style.visibility = child.dataset.originalVisibility;
                        delete child.dataset.originalVisibility;
                    }
                }
                
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
    async function onClick(e: MouseEvent) {
        if (node.disabled || node.dataset.loading) return;
        
        const result = clickHandler(e);
        if (result instanceof Promise) {
            node.dataset.loading = "true";
            
            const w = node.offsetWidth;
            const h = node.offsetHeight;
            if (w > 0 && h > 0) {
                node.style.width = w + 'px';
                node.style.height = h + 'px';
            }
            
            const computedStyle = getComputedStyle(node);
            if (computedStyle.position === 'static') {
                node.dataset.originalPosition = 'static';
                node.style.position = 'relative';
            }
            
            node.dataset.originalColor = node.style.color;
            node.style.color = 'transparent';
            
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i] as HTMLElement;
                child.dataset.originalVisibility = child.style.visibility;
                child.style.visibility = 'hidden';
            }
            
            node.disabled = true;
            
            const spinner = document.createElement('div');
            spinner.className = 'absolute inset-0 flex items-center justify-center text-zinc-500 dark:text-zinc-400';
            spinner.id = 'loading-enhance-spinner';
            spinner.innerHTML = `<svg class="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
            node.appendChild(spinner);
            
            try {
                await result;
            } finally {
                const spinnerEl = node.querySelector('#loading-enhance-spinner');
                if (spinnerEl) spinnerEl.remove();

                node.disabled = false;
                node.style.width = '';
                node.style.height = '';
                
                if (node.dataset.originalColor !== undefined) {
                    node.style.color = node.dataset.originalColor;
                    delete node.dataset.originalColor;
                }
                
                if (node.dataset.originalPosition === 'static') {
                    node.style.position = '';
                    delete node.dataset.originalPosition;
                }
                
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i] as HTMLElement;
                    if (child.dataset.originalVisibility !== undefined) {
                        child.style.visibility = child.dataset.originalVisibility;
                        delete child.dataset.originalVisibility;
                    }
                }
                
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
