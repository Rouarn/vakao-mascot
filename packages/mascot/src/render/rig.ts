/** 模板里需要被动画与交互驱动的节点集合。 */
export interface MascotRig {
  avatar: HTMLButtonElement;
  bubble: HTMLDivElement;
  rig: SVGGElement;
  head: SVGGElement;
  hairBack: SVGGElement;
  eyeOpen: NodeListOf<SVGGElement>;
  eyeClosed: NodeListOf<SVGPathElement>;
  irisL: SVGGElement;
  irisR: SVGGElement;
  armL: SVGGElement;
  armR: SVGGElement;
  groundShadow: SVGEllipseElement;
  lockL: SVGGElement;
  lockR: SVGGElement;
}

/** 一次性从 Shadow DOM 中取出骨骼节点引用。 */
export function queryRig(root: ShadowRoot): MascotRig {
  return {
    avatar: root.querySelector('.avatar') as HTMLButtonElement,
    bubble: root.querySelector('.bubble') as HTMLDivElement,
    rig: root.querySelector('#rig') as SVGGElement,
    head: root.querySelector('#head') as SVGGElement,
    hairBack: root.querySelector('#hairBack') as SVGGElement,
    eyeOpen: root.querySelectorAll<SVGGElement>('.eye-open'),
    eyeClosed: root.querySelectorAll<SVGPathElement>('.eye-closed'),
    irisL: root.querySelector('#irisL') as SVGGElement,
    irisR: root.querySelector('#irisR') as SVGGElement,
    armL: root.querySelector('#armL') as SVGGElement,
    armR: root.querySelector('#armR') as SVGGElement,
    groundShadow: root.querySelector('#groundShadow') as SVGEllipseElement,
    lockL: root.querySelector('#lockL') as SVGGElement,
    lockR: root.querySelector('#lockR') as SVGGElement,
  };
}
