import './shell.css';

import React, { useEffect, useCallback, useState } from 'react';
import { useRef } from 'react';
import { Link } from "react-router-dom";
import { Select, Combo } from "./ui";

import { FineTunesContext } from './context/fineTunesContext';
import Modal from './modal';
import PuffLoader from "react-spinners/PuffLoader";

const models = [
    { name: "ada", value: "ada" },
    { name: "curie", value: "curie" },
    { name: "davinci", value: "davinci" },
    { name: "babbage", value: "babbage" }
]

export default function ShellFinetunes() {

    const fileId = useRef(null);
    const [model, setModel] = useState(models[0].value);
    const fineTunesContext: any = React.useContext(FineTunesContext);

    const files = fineTunesContext.files.map((item: any) => {
        return { name: item.filename, value: item.id }
    })
    const fineTunes = fineTunesContext.fineTunes.map((item: any) => {
        return { name: item.fine_tuned_model, value: item.id }
    })

    const _loadFileClick = () => {
        var c: any = fileId.current;
        c.click();
    }

    const _loadFile = useCallback((e: any) => {
        var file = e.target.files[0];

        let fileblob = new Blob([file], { type: 'application/jsonl', });

        var reader = new FileReader();
        reader.onload = function (e: any) {
            fineTunesContext.setJsonL(fileblob, file.name, e.target.result);
        }
        reader.readAsText(file)
    }, [fineTunesContext]);

    const _selectFile = (e: any) => {
        const item = fineTunesContext.files.find((x: any) => x.id === e.target.value)
        fineTunesContext.setSelectedFile(item);
    }

    const _selectFineTune = (e: any) => {
        const item = fineTunesContext.fineTunes.find((x: any) => x.id === e.target.value)
        fineTunesContext.setSelectedFineTune(item);
    }

    useEffect(() => {
        const el: any = fileId.current;
        el.addEventListener('change', _loadFile, false);
    }, [_loadFile, fileId])

    return <div className="shell">

        {fineTunesContext.loading ? <Modal><h2>{fineTunesContext.currentModel !== '' ? "processing..." : "asking for models"}</h2><br /><PuffLoader color="#fff" /></Modal> : null}


        <div className="app-bar">
            <Link to="/">Prompts</Link> | <Link to="/finetunes"><b>Fine-Tunes</b></Link>
        </div>

        <div className="ft">
            <h3>JSONL</h3>

            <div className="ft-jsol-data">
                <div style={{ width: "100%", height: "160px", marginRight: "1rem" }}>
                    <textarea defaultValue={fineTunesContext.jsonl} />
                </div>
                <div style={{ width: "min-content", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <button className='button-primary' onClick={() => _loadFileClick()}>Browse for JSONL</button>
                    <input type="file" id="file-selector" ref={fileId} hidden={true} />
                    <button className='button-primary' onClick={() => fineTunesContext.uploadJsonL()}>Upload JSONL</button>
                </div>
            </div>

            <div className="ft-fine-tunes">
                <div>
                    <h3>Files</h3>
                    <div style={{ display: "flex", flexDirection: "row", height: "calc(100% - 80px)", width: "100%", justifyContent: "space-between" }} >
                        <div style={{ marginRight: "1rem", width: "100%" }} >
                            <Select items={files} onChange={_selectFile} />
                        </div>
                        <div style={{ marginRight: "1rem", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "300px" }} >
                            <div style={{ fontSize: "10px" }}>
                                {!fineTunesContext.selectedFile ? null : <>
                                    <label>ID</label><span>{fineTunesContext.selectedFile.id}</span><br /><br />
                                    <label>Name</label><span>{fineTunesContext.selectedFile.filename}</span><br /><br />
                                    <label>Bytes</label><span>{fineTunesContext.selectedFile.bytes}</span><br /><br />
                                    <label>Created</label><span>{fineTunesContext.selectedFile.created_at}</span><br /><br />
                                    <label>Purpose</label><span>{fineTunesContext.selectedFile.purpose}</span><br /><br />
                                    <label>Status</label><span>{fineTunesContext.selectedFile.status}</span><br /><br />
                                    <label>Status Details</label><span>{fineTunesContext.selectedFile.status_details || "N/A"}</span>
                                    <br /><br />
                                    <button onClick={() => fineTunesContext.deleteFile()}>Delete File</button>
                                </>}
                            </div>

                            {fineTunesContext.selectedFile && fineTunesContext.selectedFile.purpose === "fine-tune" ?
                                <div>
                                    <h5>Create Fine Tune</h5>
                                    <label>Base Model</label>
                                    <div style={{ marginBottom: "10px" }}>
                                        <Combo items={models} onChange={(e: any) => setModel(e.target.value)} />
                                    </div>
                                    <button className='button-primary' onClick={() => fineTunesContext.createFineTune(model)}>Start</button>
                                </div>
                                : null}
                        </div>
                    </div>
                </div>

                <div className="">
                    <h3>Fine-Tunes</h3>
                    <div style={{ display: "flex", flexDirection: "row", height: "calc(100% - 80px)", width: "100%", justifyContent: "space-between" }} >
                        <div style={{ marginRight: "1rem", width: "100%" }} >
                            <Select items={fineTunes} onChange={_selectFineTune} />
                        </div>
                        <div style={{ marginRight: "1rem", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "300px" }} >
                            <div style={{ fontSize: "10px" }}>
                                {!fineTunesContext.selectedFineTune ? null : <>
                                    <label>ID</label><span>{fineTunesContext.selectedFineTune.id}</span><br /><br />
                                    <label>Base Model</label><span>{fineTunesContext.selectedFineTune.model}</span><br /><br />
                                    <label>Created</label><span>{fineTunesContext.selectedFineTune.created_at}</span><br /><br />
                                    <label>Updates</label><span>{fineTunesContext.selectedFineTune.updated_at}</span><br /><br />
                                    <label>Training Files</label>
                                    {fineTunesContext.selectedFineTune.training_files && fineTunesContext.selectedFineTune.training_files.map((item: any) => {
                                        return <div key={item.id}><span >{item.id}</span></div>
                                    })}
                                    {fineTunesContext.selectedFineTune.training_files.length === 0 ? <>0<br /></> : null}
                                    <br />
                                    <label>Validation Files</label>
                                    {fineTunesContext.selectedFineTune.validation_files.map((item: any) => {
                                        return <div key={item.id}><span >{item.id}</span></div>
                                    })}
                                    {fineTunesContext.selectedFineTune.validation_files.length === 0 ? <>0<br /></> : null}
                                    <br />
                                    <label>Modal Name</label><span>{fineTunesContext.selectedFineTune.fine_tuned_model}</span><br /><br />
                                    <label>Modal Found</label><span>{fineTunesContext.selectedFineTune.model_found ? "found" : "not found"}</span><br /><br />
                                    {fineTunesContext.selectedFineTune.model_found ? <button onClick={() => fineTunesContext.deleteFineTune()}>Delete Model</button> : null}
                                </>}
                            </div>

                            <div>
                                <button className='button-primary' onClick={() => fineTunesContext.getEvents()}>Events</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="">
                    <h3>Fine-Tunes events</h3>
                    <div style={{ display: "flex", flexDirection: "row", height: "calc(100% - 80px)", width: "100%", justifyContent: "space-between" }} >
                        <div style={{ marginRight: "1rem", width: "100%" }} >
                            <textarea defaultValue={fineTunesContext.selectedEvents} />
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </div>
}