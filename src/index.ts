import {
  DocumentRegistry
} from '@jupyterlab/docregistry'

import {
  INotebookModel,
  NotebookPanel
} from '@jupyterlab/notebook'

import {
  JupyterLabPlugin,
  JupyterLab
} from '@jupyterlab/application'

import {
  IDisposable,
  DisposableDelegate
} from '@phosphor/disposable'

import {
  Widget
} from '@phosphor/widgets'

import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces'

import candela from 'candela';
import 'candela/plugins/vega/load';

const MIME_TYPE = 'application/vnd.candela+json';

type INBWidgetExtension = DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>;

class CandelaWidget extends Widget implements IRenderMime.IRenderer {
  constructor(options: IRenderMime.IRendererOptions) {
    super();
  }

  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    let div = document.createElement('div');
    let params = model.data[MIME_TYPE] as any;
    this.node.appendChild(div);
    setTimeout(() => {
      let vis = new candela.components[params.type](div, params.options);
      vis.render();
    }, 1);
    return Promise.resolve();
  }
}

class NBWidgetExtension implements INBWidgetExtension {
  createNew(nb: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    nb.rendermime.addFactory({
      safe: false,
      mimeTypes: [MIME_TYPE],
      createRenderer: (options) => new CandelaWidget(options)
    }, 0);

    return new DisposableDelegate(() => {
      if (nb.rendermime) {
        nb.rendermime.removeMimeType(MIME_TYPE);
      }
    });
  }
}

const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_candela',
  autoStart: true,
  activate: (app: JupyterLab) => {
    console.log('JupyterLab extension jupyterlab_candela is activated and ready!');
    app.docRegistry.addWidgetExtension('Notebook', new NBWidgetExtension());
  }
};

export default extension;
