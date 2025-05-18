export function SRGBToLinear(c: any): number;
export function LinearToSRGB(c: any): number;
export namespace ColorManagement {
    export let enabled: boolean;
    export { LinearSRGBColorSpace as _workingColorSpace };
    export let workingColorSpace: string;
    export function convert(color: any, sourceColorSpace: any, targetColorSpace: any): any;
    export function fromWorkingColorSpace(color: any, targetColorSpace: any): any;
    export function toWorkingColorSpace(color: any, sourceColorSpace: any): any;
    export function getPrimaries(colorSpace: any): any;
    export function getTransfer(colorSpace: any): any;
}
import { LinearSRGBColorSpace } from '../constants.js';
