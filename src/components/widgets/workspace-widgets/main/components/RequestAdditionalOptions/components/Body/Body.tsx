import { useAppDispatch, useAppSelector } from "../../../../../../../../hooks/redux/redux";
import { useClassnames } from "../../../../../../../../hooks/useClassnames";

import requestBodyFormDataSlice from "../../../../../../../../redux/reducers/requestBodyFormDataSlice";

import { BodyNone } from "./BodyNone";
import { FormDataList } from "./content-types-lists/FormDataBody/FormDataList";

import { IconChevronDown, IconFilePlus, IconPlus, IconTrash } from "@tabler/icons-react";
import { BodyContentTypesList } from "./content-types-lists/BodyContentTypesList";
import { BodyRawTypesList } from "./content-types-lists/BodyRawTypesList";
import Tippy from "@tippyjs/react";

import { v1 as uuidv1 } from "uuid";

import "./styles/Body.scss";
import "./styles/BodyNone.scss";
import Modal from "../../../../../../../UI/Modal/Modal";
import { useState, useRef } from "react";
import Input from "../../../../../../../UI/Input/Input";
import { FileSelect } from "../../../../../../../UI/FileSelect/FileSelect";
import { Dropdown } from "../../../../../../../UI/Dropdown/Dropdown";

/** TODO:
 * ✓ Пофиксить сообщение об отсутствии елементов в form-data сторе
 * ✓ Пофиксить отображение items в кастомных методах запроса
 * ✓ Сделать разный функционал кнопки которая очищает весь стор в body для разных contentType
 * - Модалка для добавления form-data элементов
 * ✓ Декомпозировать элементы по типу списков и всплывающих подсказок
 */

const body_types = {
	"none": <BodyNone />,
	"form-data": <FormDataList />,
	"x-www-form-urlencoded": <>x-www-form-urlencoded</>,
	"raw": <>raw</>
};

export const Body = () => {
	const [newFormDataModalView, setNewFormDataModalView] = useState(false);

	// ! -----------------------------------------------------------------------------------------------

	const [newFormDataItem, setNewFormDataItem] = useState<null | {
		id: string;
		name: string;
		blob: Blob;
	}>(null);
	const [newFormDataItemType, setNewFormDataItemType] = useState<null | string>("Text");

	const formDataItemKeyRef = useRef<HTMLInputElement>(null);
	const formDataItemValueRef = useRef<HTMLInputElement>(null);

	// ! -----------------------------------------------------------------------------------------------

	const dispatch = useAppDispatch();
	const { addBodyFormDataItem, clearFormData } = requestBodyFormDataSlice.actions;
	const { contentType, rawType } = useAppSelector((state) => state.requestBodyTypeReducer);

	const request_body_classnames = useClassnames({
		request_body_none_wrapper: contentType === "none",
		request_body_wrapper: contentType !== "none"
	});

	const clear_all_functions = {
		"form-data": () => {
			dispatch(clearFormData());
			// ! -------------------------------------------------------

			const idbRequest = indexedDB.open("request-body-files", 1);
			idbRequest.onsuccess = () => {
				const db = idbRequest.result;
				const tx = db.transaction("files", "readwrite");
				const filesStore = tx.objectStore("files");
				const emptyStore = filesStore.clear();

				emptyStore.onsuccess = () => {
					tx.oncomplete = () => {
						db.close();
					};
				};
			};

			// ! -------------------------------------------------------
		},
		"x-www-form-urlencoded": clearFormData, // ? Изменить на urlencodedData
		"raw": clearFormData // ? Изменить на rawData
	};

	return (
		<>
			<Modal
				title="Adding a new form-data body item"
				visibility={newFormDataModalView}
				onSubmit={() => {
					if (!!newFormDataItem) {
						const idbRequest = indexedDB.open("request-body-files", 1);
						idbRequest.onsuccess = () => {
							const db = idbRequest.result;
							const tx = db.transaction("files", "readwrite");
							const filesStore = tx.objectStore("files");

							const newFile = filesStore.put({
								id: newFormDataItem.id,
								name: newFormDataItem.name,
								blob: newFormDataItem.blob
							});

							newFile.onsuccess = () => {
								tx.oncomplete = () => {
									db.close();
								};
							};
						};
						dispatch(
							addBodyFormDataItem({
								_id: uuidv1(),
								isUsed: true,
								valueType: "file",
								value: "",
								key: formDataItemKeyRef.current!.value,
								fileInfo: {
									id: newFormDataItem.id,
									name: newFormDataItem.name
								}
							})
						);
					} else {
						dispatch(
							addBodyFormDataItem({
								_id: uuidv1(),
								isUsed: true,
								valueType: "text",
								value: formDataItemValueRef.current!.value,
								key: formDataItemKeyRef.current!.value,
								fileInfo: {
									id: "",
									name: ""
								}
							})
						);
					}
					return true;
				}}
				onCancel={() => true}
				onClose={() => setNewFormDataModalView(false)}
			>
				<div className="form_data_item_adding_modal">
					<div className="form_data_modal_item_key">
						<Input
							label="Enter form-data key:"
							placeholder="Some key..."
							innerRef={formDataItemKeyRef}
						/>
					</div>
					<div className="form_data_modal_item_value">
						<div>
							<Dropdown
								data={["Text", "File"]}
								onChange={(value) => {
									setNewFormDataItemType(value);
								}}
								title="Select form-data item value type:"
								placeholder="Type..."
								searchIcon={false}
								initValue={newFormDataItemType!}
								disableSearch={true}
							/>
						</div>
						{newFormDataItemType === "Text" ? (
							<div>
								<Input
									label="Enter form-data value:"
									placeholder="Some value..."
									innerRef={formDataItemValueRef}
								/>
							</div>
						) : (
							<div className="form_data_modal_select_file">
								<FileSelect
									placeholder="Click to upload file"
									onChange={async (event) => {
										const fileId: string = uuidv1();
										const fileName: string = event.target.files![0].name;
										const tempUrlToFile = URL.createObjectURL(event.target.files![0]);
										const blobFromFile = await fetch(tempUrlToFile).then((res) => res.blob());

										setNewFormDataItem({
											id: fileId,
											name: fileName,
											blob: blobFromFile
										});
									}}
								/>
							</div>
						)}
					</div>
				</div>
			</Modal>
			<section className="request_additional_option_header_wrapper">
				<div className="body_conntent_type_select_wrapper">
					<span className="request_additional_option_name">Body</span>
					<div className="request_additional_body_type">
						<Tippy
							className="body_content_type_tippy_wrapper"
							placement="bottom"
							content={<BodyContentTypesList />}
							interactive={true}
							hideOnClick={true}
							animation="shift-away"
							trigger="click"
							arrow={false}
							zIndex={10}
							offset={[49, 5]}
						>
							<div className="body_content_type_select">
								<span className="body_content_type">{contentType}</span>
								<IconChevronDown size={15} />
							</div>
						</Tippy>
					</div>
					{contentType === "raw" && (
						<Tippy
							className="body_raw_type_tippy_wrapper"
							placement="bottom"
							content={<BodyRawTypesList />}
							interactive={true}
							hideOnClick={true}
							animation="shift-away"
							trigger="click"
							arrow={false}
							zIndex={10}
							offset={[15, 5]}
						>
							<div className="body_raw_type_select">
								<span className="body_raw_type">{rawType}</span>
								<IconChevronDown size={15} />
							</div>
						</Tippy>
					)}
				</div>
				<div className="request_additional_option_controls">
					{contentType === "raw" && (
						<div className="add_new">
							<Tippy
								className="base_tippy_wrapper"
								placement="top"
								content={"Import"}
								animation="shift-away"
								arrow={true}
								trigger="mouseenter"
								zIndex={0}
							>
								<IconFilePlus
									size={16}
									stroke={2}
								/>
							</Tippy>
						</div>
					)}
					{contentType === "form-data" && (
						<div className="add_new">
							<Tippy
								className="base_tippy_wrapper"
								placement="top"
								content={"Add new"}
								animation="shift-away"
								arrow={true}
								trigger="mouseenter"
								zIndex={0}
							>
								<IconPlus
									size={16}
									onClick={() => {
										setNewFormDataModalView(true);
									}}
								/>
							</Tippy>
						</div>
					)}
					{contentType !== "none" && (
						<div className="delete_all">
							<Tippy
								className="base_tippy_wrapper"
								placement="top"
								content={"Clear all"}
								animation="shift-away"
								arrow={true}
								trigger="mouseenter"
								zIndex={0}
								offset={[-15, 10]}
							>
								<IconTrash
									size={16}
									stroke={2}
									onClick={() => {
										clear_all_functions[contentType]();
									}}
								/>
							</Tippy>
						</div>
					)}
				</div>
			</section>
			<section className={request_body_classnames}>{body_types[contentType]}</section>
		</>
	);
};
